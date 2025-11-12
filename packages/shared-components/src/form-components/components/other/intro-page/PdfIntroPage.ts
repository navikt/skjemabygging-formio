import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { FormContextType } from '../../../../context/form/FormContext';
import { LanguageContextType } from '../../../../context/languages/languages-context';
import { PdfListElement } from '../../../types';

interface Props {
  formContextValue: FormContextType;
  languagesContextValue: LanguageContextType;
}

const PdfIntroPage = ({ formContextValue, languagesContextValue }: Props): PdfListElement => {
  const { translate } = languagesContextValue;
  const { submission, form } = formContextValue;

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
