import { useLanguage } from '../../context/language/LanguageContext';

interface Props {
  translationKey: string;
  required?: boolean;
  readOnly?: boolean;
  showOptionalText?: boolean;
}

const TranslatedLabel = ({ translationKey, required = false, readOnly = false, showOptionalText = true }: Props) => {
  const { translate } = useLanguage();
  return (
    <>
      {translate(translationKey)}
      {required || readOnly || !showOptionalText ? '' : ` (${translate('valgfritt')})`}
    </>
  );
};

export default TranslatedLabel;
