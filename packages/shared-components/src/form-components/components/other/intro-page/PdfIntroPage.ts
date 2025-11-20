import { Form, Submission, TEXTS, Tkey, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfListElement } from '../../../types';

interface Props {
  submission: Submission;
  form: Form;
  translate: TranslateFunction;
}

const PdfIntroPage = ({ submission, form, translate }: Props): PdfListElement => {
  if (!form.introPage?.enabled) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

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
