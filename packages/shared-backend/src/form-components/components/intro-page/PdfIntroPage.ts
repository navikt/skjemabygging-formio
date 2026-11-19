import {
  Form,
  introPageTexts,
  PdfData,
  Submission,
  TEXTS,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  submission: Submission;
  form: Form;
  translate: TranslateFunction;
}

const PdfIntroPage = ({ submission, form, translate }: Props): PdfData | null => {
  if (!form.introPage?.enabled) {
    return null;
  }

  const inputLabel = introPageTexts.selfDeclaration.inputLabel;

  return {
    label: translate(TEXTS.grensesnitt.introPage.title),
    verdiliste: [
      {
        label: translate(inputLabel),
        verdi: submission?.selfDeclaration ? translate(TEXTS.common.yes) : '-',
      },
    ],
  };
};

export default PdfIntroPage;
