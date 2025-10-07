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

  if (!submissionMethod || submissionMethod === 'digital' || !signatures) {
    return null;
  }

  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);

  const getSignature = (label, description) => {
    return {
      label: label,
      verdiliste: [
        { label: translate(description), verdi: ' ' },
        { label: translate(TEXTS.pdfStatiske.placeAndDate), verdi: ' ' },
        { label: translate(TEXTS.pdfStatiske.signature), verdi: ' ' },
        { label: translate(TEXTS.pdfStatiske.signatureName), verdi: ' ' },
      ],
    };
  };

  if (signatureList.length === 1 && (signatureList[0].label === undefined || signatureList[0].label === '')) {
    return {
      label: translate(TEXTS.pdfStatiske.signature),
      verdiliste: [getSignature(signatureList[0].label, signatureList[0].description)],
    };
  }

  return {
    label: translate(TEXTS.pdfStatiske.signature),
    verdiliste: [
      {
        label: translate(descriptionOfSignatures || ''),
        verdi: '',
      },
      ...signatureList.map((signatureObject) => getSignature(signatureObject.label, signatureObject.description)),
    ],
  };
};

export default PdfSignature;
