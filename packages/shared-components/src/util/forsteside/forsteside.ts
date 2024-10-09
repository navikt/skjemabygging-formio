import { ForstesideRequestBody, Mottaksadresse, SubmissionDefault } from '@navikt/skjemadigitalisering-shared-domain';
import {
  getAttachmentLabels,
  getAttachmentTitles,
  getRecipients,
  getTitle,
  getUserData,
  parseLanguage,
} from './forstesideUtils';

const genererFoerstesideData = (
  form,
  submission: SubmissionDefault,
  language = 'nb-NO',
  recipients: Mottaksadresse[] = [],
  unitNumber?: string,
): ForstesideRequestBody => {
  const {
    properties: { skjemanummer, tema, mottaksadresseId },
    title,
  } = form;

  const formTitle = getTitle(title, skjemanummer);

  return {
    ...getUserData(submission),
    foerstesidetype: 'SKJEMA',
    navSkjemaId: skjemanummer,
    spraakkode: parseLanguage(language),
    overskriftstittel: formTitle,
    arkivtittel: formTitle,
    tema,
    vedleggsliste: getAttachmentTitles(form, submission),
    dokumentlisteFoersteside: [formTitle, ...getAttachmentLabels(form, submission)],
    ...getRecipients(mottaksadresseId, recipients, unitNumber),
  };
};

export { genererFoerstesideData };
