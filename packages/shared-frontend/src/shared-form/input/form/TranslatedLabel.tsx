type LabelOptions = {
  required?: boolean;
  readOnly?: boolean;
};

interface TranslatedLabelProps {
  children: string;
  translate: (text: string) => string;
  options?: LabelOptions;
}

const TranslatedLabel = ({ children, options, translate }: TranslatedLabelProps) => {
  const { required = false, readOnly = false } = options ?? {};

  return (
    <>
      {translate(children)}
      {required || readOnly ? '' : ` (${translate('valgfritt')})`}
    </>
  );
};

export default TranslatedLabel;
export type { TranslatedLabelProps };
