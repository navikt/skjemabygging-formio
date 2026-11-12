import {
  Component,
  CoverPageDownloadType,
  Enhetstype,
  Form,
  navFormUtils,
  NavUnitSelectComponent,
  resolveParty,
  ResponseError,
  SendinnUserType,
  Submission,
  SubmissionData,
  submissionUtils,
  TranslateFunction,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper } from './mapper';

type UserTypeMode = 'hidden' | 'forced-unit' | SendinnUserType;

interface SubsequentSubmissionDownloadData {
  data: CoverPageDownloadType;
  unitTypes?: Enhetstype[];
}

const invalidAnswer = (): never => {
  throw new ResponseError('BAD_REQUEST', 'Invalid cover page answers');
};

const isRecord = (value: unknown): value is SubmissionData =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Keep only answers to active inputs, so hidden identity and routing answers cannot reach resolveParty.
const projectSubmission = (components: Component[], original: SubmissionData): SubmissionData =>
  Object.fromEntries(
    components.flatMap((component): [string, SubmissionData[string]][] => {
      if (component.components) {
        if (component.input || component.tree) {
          const nested = original[component.key];
          return [[component.key, projectSubmission(component.components, isRecord(nested) ? nested : {})]];
        }
        return Object.entries(projectSubmission(component.components, original));
      }
      const value = original[component.key];
      return component.input && value !== undefined && value !== null ? [[component.key, value]] : [];
    }),
  );

const resolveUserTypeMode = (form: Form, data: SubmissionData): UserTypeMode => {
  if (form.properties.hideUserTypes === true) return 'hidden';
  if (form.properties.enhetMaVelgesVedPapirInnsending === true) {
    return data.userType === undefined ? 'forced-unit' : invalidAnswer();
  }
  const choice = navFormUtils.flattenComponents(form.components).find((component) => component.key === 'userType');
  return choice?.values?.some(({ value }) => value === data.userType)
    ? (data.userType as SendinnUserType)
    : invalidAnswer();
};

const resolveUser = (mode: UserTypeMode, form: Form, submission: Submission): CoverPageDownloadType['user'] => {
  if (mode !== 'identified-person' && mode !== 'unidentified-person') return undefined;
  const party = resolveParty(form, submission);
  const user = party && coverPageMapper.mapPartyToCoverPage(party).user;
  // resolveParty falls back to other identity sources, so the result must match the chosen user type.
  const matchesMode =
    mode === 'identified-person' ? !!user?.nationalIdentityNumber : !!(user?.firstName && user.surname && user.address);
  return matchesMode ? user : invalidAnswer();
};

const createSubsequentSubmissionDownloadData = ({
  form,
  submission: { data: rawData },
  language,
  translate,
}: {
  form: Form;
  submission: Submission;
  language: TranslationLang;
  translate?: TranslateFunction;
}): SubsequentSubmissionDownloadData => {
  const mode = resolveUserTypeMode(form, rawData);
  const activeForm = {
    ...form,
    components: navFormUtils.getAllActivePanelsFromForm(form, { data: rawData }, { submissionMethod: 'paper' }),
  };
  const submission: Submission = { data: projectSubmission(activeForm.components, rawData) };
  const fields = submissionUtils.flattenComponentsWithPath(activeForm.components);
  if (!fields.some(({ component }) => component.type === 'attachment')) {
    throw new ResponseError('BAD_REQUEST', 'No attachments are available');
  }

  const unitField = fields.find(({ component }) => component.type === 'navUnitSelect');
  const navUnit = unitField && submissionUtils.getSubmissionValue(unitField.submissionPath, submission);
  if (unitField && (typeof navUnit !== 'string' || !navUnit)) invalidAnswer();

  return {
    data: {
      type: 'ETTERSENDELSE',
      submissionType: 'PAPER',
      languageCode: language,
      form: { title: form.title, skjemanummer: form.properties.skjemanummer, properties: form.properties },
      user: resolveUser(mode, activeForm, submission),
      ...(navUnit ? { recipient: { navUnit } } : {}),
      ...coverPageMapper.createAttachmentDocumentLists(activeForm, submission, translate),
    },
    unitTypes: (unitField?.component as NavUnitSelectComponent | undefined)?.unitTypes,
  };
};

export { createSubsequentSubmissionDownloadData };
export type { SubsequentSubmissionDownloadData };
