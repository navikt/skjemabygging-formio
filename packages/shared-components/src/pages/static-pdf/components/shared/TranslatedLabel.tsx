import { useLanguages } from '../../../../context/languages';

type LabelOptions = {
  required?: boolean;
  readOnly?: boolean;
};

interface Props {
  children: string;
  options?: LabelOptions;
}

const TranslatedLabel = ({ children, options }: Props) => {
  const { translate } = useLanguages();
  const { required = false, readOnly = false } = options ?? {};

  return (
    <>
      {translate(children)}
      {required || readOnly ? '' : ` (${translate('valgfritt')})`}
    </>
  );
};

export default TranslatedLabel;
