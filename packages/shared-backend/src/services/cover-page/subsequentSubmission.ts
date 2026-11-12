import {
  Component,
  Form,
  navFormUtils,
  resolveParty,
  ResponseError,
  Submission,
  submissionUtils,
  TranslateFunction,
  TranslationLang,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper } from './mapper';
import { SubsequentSubmissionCoverPageData, SubsequentSubmissionUser } from './subsequentSubmissionTypes';

const invalidAnswer = (): never => {
  throw new ResponseError('BAD_REQUEST', 'Invalid cover page answers');
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const requireText = (value: unknown, required = true): string | undefined => {
  if (value === undefined || value === null || value === '') {
    if (required) invalidAnswer();
    return undefined;
  }
  if (typeof value !== 'string' || !validatorUtils.isValidCoverPageValue(value)) {
    return invalidAnswer();
  }
  return value;
};

// Project only active canonical inputs. Inactive identity and routing answers cannot affect resolveParty.
const projectSubmission = (components: Component[], original: Record<string, unknown>): Submission['data'] =>
  Object.fromEntries(
    components.flatMap((component): [string, Submission['data'][string]][] => {
      if (component.components) {
        if (component.input || component.tree) {
          const nested = original[component.key];
          if (nested !== undefined && !isRecord(nested)) invalidAnswer();
          return [[component.key, projectSubmission(component.components, isRecord(nested) ? nested : {})]];
        }
        return Object.entries(projectSubmission(component.components, original));
      }
      const value = original[component.key];
      return component.input &&
        value !== undefined &&
        value !== null &&
        (typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value === 'object')
        ? [[component.key, value]]
        : [];
    }),
  );

const validateAttachments = (form: Form, submission: Submission, raw: Submission) => {
  const available = submissionUtils
    .flattenComponentsWithPath(form.components)
    .filter(({ component }) => component.type === 'attachment');
  if (!available.length) throw new ResponseError('BAD_REQUEST', 'No attachments are available');
  if (raw.attachments !== undefined && (!Array.isArray(raw.attachments) || raw.attachments.length)) invalidAnswer();
};

const createSubsequentSubmissionDownloadData = ({
  form,
  submission: raw,
  language,
  translate,
}: {
  form: Form;
  submission: Submission;
  language: TranslationLang;
  translate?: TranslateFunction;
}): SubsequentSubmissionCoverPageData => {
  if (!isRecord(raw) || !isRecord(raw.data)) return invalidAnswer();
  const activeForm = {
    ...form,
    components: navFormUtils.getAllActivePanelsFromForm(form, raw, { submissionMethod: 'paper' }),
  };
  const submission: Submission = { data: projectSubmission(activeForm.components, raw.data) };
  const fields = submissionUtils.flattenComponentsWithPath(activeForm.components);
  const choice = fields.find(({ component }) => component.key === 'userType')?.component;
  const hidden = form.properties.hideUserTypes === true;
  const forced = !hidden && form.properties.enhetMaVelgesVedPapirInnsending === true;
  const branch = submission.data.userType;
  if (forced && raw.data.userType !== undefined) return invalidAnswer();
  if (!hidden && !forced && !choice?.values?.some(({ value }) => value === branch)) return invalidAnswer();
  let user: SubsequentSubmissionUser;
  if (hidden || forced || branch === 'multiple-people') {
    user = { collection: 'authorized-no-user', reason: hidden ? 'hidden' : forced ? 'forced-unit' : 'multiple-people' };
  } else {
    const party = resolveParty(activeForm, submission);
    if (!party) return invalidAnswer();
    const mapped = coverPageMapper.mapPartyToCoverPage(party).user;
    if (branch === 'identified-person' && mapped?.nationalIdentityNumber) {
      user = { collection: 'identified-person', user: { nationalIdentityNumber: mapped.nationalIdentityNumber } };
    } else if (
      branch === 'unidentified-person' &&
      mapped &&
      'firstName' in mapped &&
      mapped.firstName &&
      mapped.surname &&
      mapped.address
    ) {
      user = {
        collection: 'unidentified-person',
        user: { firstName: mapped.firstName, surname: mapped.surname, address: mapped.address },
      };
    } else return invalidAnswer();
  }
  validateAttachments(activeForm, submission, raw);
  const unitField = fields.find(({ component }) => component.type === 'navUnitSelect');
  const navUnit = unitField
    ? requireText(submissionUtils.getSubmissionValue(unitField.submissionPath, submission))
    : undefined;
  return {
    type: 'ETTERSENDELSE',
    submissionType: 'PAPER',
    languageCode: language,
    form: { title: form.title, skjemanummer: form.properties.skjemanummer, properties: form.properties },
    ...user,
    ...(navUnit ? { recipient: { navUnit } } : {}),
    ...coverPageMapper.createAttachmentDocumentLists(activeForm, submission, translate),
  };
};

export { createSubsequentSubmissionDownloadData };
