import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { FormContextType } from '../../../../context/form/FormContext';
import { LanguageContextType } from '../../../../context/languages/languages-context';

interface Props {
  formContext: FormContextType;
  languagesContext: LanguageContextType;
}

const PdfIntroPage = ({ formContext, languagesContext }: Props) => {
  const { translate } = languagesContext;
  const { submission, form } = formContext;

  if (!form.introPage?.enabled) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

  return {
    label: translate(inputLabel),
    value: submission?.selfDeclaration ? translate(TEXTS.common.yes) : '-',
  };
};

export default PdfIntroPage;
