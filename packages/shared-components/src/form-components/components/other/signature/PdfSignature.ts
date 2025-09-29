import { FormPropertiesType, signatureUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../../../context/config/configContext';
import { useLanguages } from '../../../../context/languages';
import { PdfData } from '../../../types';

interface Props {
  properties: FormPropertiesType;
}

const PdfSignature = ({ properties }: Props): PdfData | null => {
  const { signatures, descriptionOfSignatures } = properties;
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();

  if (submissionMethod !== 'paper' || !signatures) {
    return null;
  }

  const getSignature = (label, description) => {
    return {
      label: translate(label),
      verdiliste: [
        { label: translate(description), verdi: ' ' },
        { label: translate(TEXTS.pdfStatiske.placeAndDate), verdi: ' ' },
        { label: translate(TEXTS.pdfStatiske.signature), verdi: ' ' },
        { label: translate(TEXTS.pdfStatiske.signatureName), verdi: ' ' },
      ],
    };
  };

  const getSignatureList = () => {
    const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);

    if (signatureList.length === 1 && (signatureList[0].label === undefined || signatureList[0].label === '')) {
      return [getSignature(signatureList[0].description, descriptionOfSignatures || '')];
    }

    return [
      getSignature(translate(descriptionOfSignatures || ''), ''),
      ...signatureList.map((signatureObject) => getSignature(signatureObject.label, signatureObject.description)),
    ];
  };

  return {
    label: translate(TEXTS.pdfStatiske.signature),
    verdiliste: getSignatureList(),
  };
};

export default PdfSignature;
