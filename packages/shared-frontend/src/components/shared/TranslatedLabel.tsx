import { useLanguage } from '../../context/language/LanguageContext';

interface Props {
  children: string;
  required?: boolean;
  readOnly?: boolean;
  showOptionalText?: boolean;
}

const TranslatedLabel = ({ children, required = false, readOnly = false, showOptionalText = true }: Props) => {
  const { translate } = useLanguage();
  return (
    <>
      {translate(children)}
      {required || readOnly || !showOptionalText ? '' : ` (${translate('valgfritt')})`}
    </>
  );
};

export default TranslatedLabel;
