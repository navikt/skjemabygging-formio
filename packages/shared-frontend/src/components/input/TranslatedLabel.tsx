import { useLanguage } from '../../context/language/LanguageContext';

interface Props {
  children: string;
  required?: boolean;
  readOnly?: boolean;
}

const TranslatedLabel = ({ children, required = false, readOnly = false }: Props) => {
  const { translate } = useLanguage();
  return (
    <>
      {translate(children)}
      {required || readOnly ? '' : ` (${translate('valgfritt')})`}
    </>
  );
};

export default TranslatedLabel;
