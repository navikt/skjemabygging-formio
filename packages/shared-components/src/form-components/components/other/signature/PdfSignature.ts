import {
  FormPropertiesType,
  signatureUtils,
  Submission,
  SubmissionMethod,
  TEXTS,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { PdfData } from '../../../types';

interface Props {
  properties: FormPropertiesType;
  submission: Submission;
  translate: TranslateFunction;
  submissionMethod?: SubmissionMethod;
}

const PdfSignature = ({ properties, submission, submissionMethod, translate }: Props): PdfData | null => {
  const { signatures, descriptionOfSignatures } = properties;

  if (submissionMethod === 'digital') {
    return null;
  }

  if (submissionMethod === 'digitalnologin') {
    const personalId = submission?.attachments?.find((attachment) => attachment.attachmentId === 'personal-id');
    if (!personalId) {
      throw Error('Finner ikke opplastet legitimasjon');
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

  const getSignatureField = (description: string) => {
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
          label: translate(signatureObject.label),
          verdiliste: getSignatureField(signatureObject.description),
        };
      }),
    ],
  };
};

export default PdfSignature;
