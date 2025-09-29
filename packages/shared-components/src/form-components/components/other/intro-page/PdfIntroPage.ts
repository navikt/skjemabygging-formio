import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';

const PdfIntroPage = () => {
  const { translate } = useLanguages();
  const { submission, form } = useForm();

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
