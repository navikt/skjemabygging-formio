import {
  FormPropertiesType,
  signatureUtils,
  SubmissionMethod,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { LanguageContextType } from '../../../../context/languages/languages-context';
import { PdfData } from '../../../types';

interface Props {
  properties: FormPropertiesType;
  languagesContextValue: LanguageContextType;
  submissionMethod?: SubmissionMethod;
}

const PdfSignature = ({ properties, languagesContextValue, submissionMethod }: Props): PdfData | null => {
  const { signatures, descriptionOfSignatures } = properties;
  const { translate } = languagesContextValue;

  if (submissionMethod === 'digital') {
    return null;
  }

  if (submissionMethod === 'digitalnologin') {
    // Replace this with confirmation that the user has signed with id.
    // See: https://trello.com/c/vvlmMqvY/2717-justeringer-i-pdf-i-forbindelse-med-uinnlogget-digital
    return null;
  }

  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);

  const getSignatureField = (description) => {
    return [
      { label: translate(description), verdi: ' ' },
      { label: translate(TEXTS.pdfStatiske.placeAndDate), verdi: ' ' },
      { label: translate(TEXTS.pdfStatiske.signature), verdi: ' ' },
      { label: translate(TEXTS.pdfStatiske.signatureName), verdi: ' ' },
    ];
  };

  if (signatureList.length === 1 && (signatureList[0].label === undefined || signatureList[0].label === '')) {
    return {
      label: translate(TEXTS.pdfStatiske.signature),
      verdiliste: getSignatureField(signatureList[0].description),
    };
  }

  return {
    label: translate(TEXTS.pdfStatiske.signature),
    verdiliste: [
      {
        label: translate(descriptionOfSignatures || ''),
        verdi: '',
      },
      ...signatureList.map((signatureObject) => {
        return {
          label: signatureObject.label,
          verdiliste: getSignatureField(signatureObject.description),
        };
      }),
    ],
  };
};

export default PdfSignature;
