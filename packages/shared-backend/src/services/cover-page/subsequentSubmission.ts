import {
  CoverPageDownloadType,
  Form,
  resolveParty,
  Submission,
  submissionUtils,
  TranslateFunction,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper } from './mapper';

// Hidden Nav unit fields are cleared by the renderer, so only the visible one has an answer.
const getNavUnit = (form: Form, submission: Submission) =>
  submissionUtils
    .flattenComponentsWithPath(form.components)
    .filter(({ component }) => component.type === 'navUnitSelect')
    .map(({ submissionPath }) => submissionUtils.getSubmissionValue(submissionPath, submission))
    .find(Boolean) as string | undefined;

const createSubsequentSubmissionDownloadData = ({
  form,
  submission,
  language,
  translate,
}: {
  form: Form;
  submission: Submission;
  language: TranslationLang;
  translate?: TranslateFunction;
}): CoverPageDownloadType => {
  const party = resolveParty(form, submission);
  const navUnit = getNavUnit(form, submission);

  return {
    type: 'ETTERSENDELSE',
    submissionType: 'PAPER',
    languageCode: language,
    form: { title: form.title, skjemanummer: form.properties.skjemanummer, properties: form.properties },
    user: party && coverPageMapper.mapPartyToCoverPage(party).user,
    ...(navUnit ? { recipient: { navUnit } } : {}),
    ...coverPageMapper.createAttachmentDocumentLists(form, submission, translate),
  };
};

export { createSubsequentSubmissionDownloadData };
