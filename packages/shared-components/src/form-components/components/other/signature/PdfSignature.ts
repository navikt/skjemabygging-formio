import {
  FormPropertiesType,
  signatureUtils,
  SubmissionMethod,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FormContextType } from '../../../../context/form/FormContext';
import { LanguageContextType } from '../../../../context/languages/languages-context';
import { PdfData } from '../../../types';

interface Props {
  properties: FormPropertiesType;
  formContextValue: FormContextType;
  languagesContextValue: LanguageContextType;
  submissionMethod?: SubmissionMethod;
}

const PdfSignature = ({
  properties,
  formContextValue,
  languagesContextValue,
  submissionMethod,
}: Props): PdfData | null => {
  const { signatures, descriptionOfSignatures } = properties;
  const { submission } = formContextValue;
  const { translate } = languagesContextValue;

  if (submissionMethod === 'digital') {
    return null;
  }

  if (submissionMethod === 'digitalnologin') {
    const personalId = submission?.attachments?.find((attachment) => attachment.attachmentId === 'personal-id');
    if (!personalId) {
      console.warn('PdfSignature: No personal ID attachment found for digitalnologin submission method');
      return null;
    }

    return {
      label: translate(TEXTS.pdfStatiske.signature),
      verdiliste: [
        {
          label: translate(TEXTS.statiske.uploadId.title),
          verdi: translate(TEXTS.statiske.uploadId[personalId.value]),
        },
      ],
    };
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
