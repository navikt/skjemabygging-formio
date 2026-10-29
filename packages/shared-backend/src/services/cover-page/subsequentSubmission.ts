import {
  Component,
  Form,
  getNavId,
  navFormUtils,
  resolveParty,
  ResponseError,
  Submission,
  SubmissionAddress,
  submissionUtils,
  toAddressValidationFields,
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

const validateAddress = (value: unknown, component: Component): SubmissionAddress => {
  if (!isRecord(value)) return invalidAnswer();
  const livesInNorway = requireText(value.borDuINorge);
  if (livesInNorway !== 'ja' && livesInNorway !== 'nei') return invalidAnswer();
  const addressChoice = livesInNorway === 'ja' ? requireText(value.vegadresseEllerPostboksadresse) : undefined;
  if (livesInNorway === 'ja' && addressChoice !== 'vegadresse' && addressChoice !== 'postboksadresse')
    return invalidAnswer();
  const country = livesInNorway === 'nei' ? value.land : { value: 'NO', label: 'Norge' };
  if (!isRecord(country)) return invalidAnswer();
  const address: SubmissionAddress = {
    borDuINorge: livesInNorway,
    ...(addressChoice ? { vegadresseEllerPostboksadresse: addressChoice } : {}),
    landkode: livesInNorway === 'ja' ? 'NO' : requireText(value.landkode)!,
    land: { value: requireText(country.value)!, label: requireText(country.label)! },
  };
  const fields = toAddressValidationFields({
    statePath: component.key,
    addressType: component.addressType,
    addressTypeWizard: component.addressTypeWizard,
    required: component.validate?.required,
    value: address,
    submissionMethod: 'paper',
  });
  const projected: Record<string, string> = {};
  fields.forEach(({ statePath, rules }) => {
    const key = statePath.split('.').at(-1)!;
    if (key === 'land') return;
    const text = requireText(value[key], rules.required);
    if (text && rules.postalCode && !validatorUtils.isPostalCode(text)) invalidAnswer();
    if (text !== undefined) projected[key] = text;
  });
  return {
    ...projected,
    landkode: address.landkode,
    land: address.land,
  };
};

const validateAttachments = (form: Form, submission: Submission, raw: Submission) => {
  const available = submissionUtils
    .flattenComponentsWithPath(form.components)
    .filter(({ component }) => component.type === 'attachment');
  if (!available.length) throw new ResponseError('BAD_REQUEST', 'No attachments are available');
  const paths = new Set(available.map(({ submissionPath }) => submissionPath));
  const inspectSelections = (value: unknown, path = '') => {
    if (Array.isArray(value)) {
      value.forEach((entry) => inspectSelections(entry, path));
    } else if (isRecord(value)) {
      if (value.value === 'leggerVedNaa' && !paths.has(path)) invalidAnswer();
      Object.entries(value).forEach(([key, child]) => inspectSelections(child, path ? `${path}.${key}` : key));
    }
  };
  inspectSelections(raw.data);
  if (raw.attachments !== undefined && (!Array.isArray(raw.attachments) || raw.attachments.length)) invalidAnswer();
  available.forEach(({ component, submissionPath }) => {
    const value: unknown = submissionUtils.getSubmissionValue(submissionPath, submission);
    if (value === undefined) return;
    const other = component.otherDocumentation || component.attachmentType === 'other';
    const records = Array.isArray(value) ? value : [value];
    if ((Array.isArray(value) && !other) || records.length > 1) invalidAnswer();
    records.forEach((record) => {
      if (!isRecord(record)) return invalidAnswer();
      const navId = getNavId(component) ?? component.key;
      if (
        record.navId !== navId ||
        typeof record.attachmentId !== 'string' ||
        !(
          record.attachmentId === navId ||
          (other &&
            record.attachmentId.startsWith(`${navId}-`) &&
            /^\d+$/.test(record.attachmentId.slice(navId.length + 1)))
        ) ||
        record.type !== (other ? 'other' : (component.attachmentType ?? 'default')) ||
        (record.files !== undefined && (!Array.isArray(record.files) || record.files.length > 0)) ||
        (record.value !== undefined && record.value !== '' && record.value !== 'leggerVedNaa')
      )
        return invalidAnswer();
      if (record.value !== 'leggerVedNaa') return;
      const title = requireText(record.title, !!other);
      if (title && validatorUtils.isValidMaxLength(title, 50)) invalidAnswer();
    });
  });
};

const createSubsequentSubmissionDownloadData = ({
  form,
  submission: raw,
  language,
  translate,
  allowTestIdentityNumbers = false,
}: {
  form: Form;
  submission: Submission;
  language: TranslationLang;
  translate?: TranslateFunction;
  allowTestIdentityNumbers?: boolean;
}): SubsequentSubmissionCoverPageData => {
  if (!isRecord(raw) || !isRecord(raw.data)) return invalidAnswer();
  const activeForm = {
    ...form,
    components: navFormUtils.getAllActivePanelsFromForm(form, raw, { submissionMethod: 'paper' }),
  };
  const submission: Submission = { data: projectSubmission(activeForm.components, raw.data) };
  const fields = submissionUtils.flattenComponentsWithPath(activeForm.components);
  const choice = fields.find(({ component }) => component.key === 'collectionType')?.component;
  const hidden = form.properties.hideUserTypes === true;
  const forced = !hidden && form.properties.enhetMaVelgesVedPapirInnsending === true;
  const branch = submission.data.collectionType;
  if (forced && raw.data.collectionType !== undefined) return invalidAnswer();
  if (!hidden && !forced && !choice?.values?.some(({ value }) => value === branch)) return invalidAnswer();
  fields.forEach(({ component, submissionPath }) => {
    const value: unknown = submissionUtils.getSubmissionValue(submissionPath, submission);
    if (component.type === 'fnrfield') {
      const identity = requireText(value);
      if (!validatorUtils.isNationalIdentityNumber(identity!, { allowTestTypes: allowTestIdentityNumbers }))
        invalidAnswer();
    } else if (component.type === 'firstName' || component.type === 'surname') {
      requireText(value, component.validate?.required);
    } else if (component.type === 'navAddress') {
      const information = submission.data.yourInformation;
      if (!isRecord(information)) return invalidAnswer();
      information[component.key] = validateAddress(value, component);
    } else if (component.type === 'radiopanel' && component.validate?.required) {
      if (!component.values?.some((option) => option.value === value)) invalidAnswer();
    } else if (component.type === 'navUnitSelect') {
      requireText(value, component.validate?.required);
    }
  });
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
