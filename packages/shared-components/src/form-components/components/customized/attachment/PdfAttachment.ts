import { VerdilisteElement } from '@navikt/fyllut-backend/src/types/familiepdf/feltMapTypes';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAttachment = ({
  component,
  submissionPath,
  formContextValue,
  languagesContextValue,
}: PdfComponentProps): VerdilisteElement[] | null => {
  const { label, attachmentValues } = component;
  const { translate } = languagesContextValue;
  const { submission } = formContextValue;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value.key) {
    return null;
  }

  const valueConfig = attachmentValues?.[value.key];
  const comment: VerdilisteElement | undefined = valueConfig?.additionalDocumentation?.enabled
    ? {
        label: translate(valueConfig.additionalDocumentation.label),
        verdi: value.additionalDocumentation || ' ',
        visningsVariant: 'PUNKTLISTE',
      }
    : undefined;

  return [
    {
      label: translate(label),
      verdi: translate(TEXTS.statiske.attachment[value.key]),
    },
    ...(comment ? [comment] : []),
  ];
};

export default PdfAttachment;
