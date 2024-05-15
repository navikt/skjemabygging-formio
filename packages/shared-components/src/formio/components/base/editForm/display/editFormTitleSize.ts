import { Component, TextSize, TextSizeShort } from '@navikt/skjemadigitalisering-shared-domain';

interface TitleSizeOptions {
  values: TextSizeShort[];
  defaultValue?: TextSizeShort;
}

const editFormTitleSizeField = (options: TitleSizeOptions): Component => {
  const sizes: { label: TextSizeShort; value: TextSize }[] = [
    { label: 'XL', value: 'xlarge' },
    { label: 'L', value: 'large' },
    { label: 'M', value: 'medium' },
    { label: 'S', value: 'small' },
    { label: 'XS', value: 'xsmall' },
  ];

  return {
    type: 'select',
    label: 'Tittelstørrelse',
    key: 'titleSize',
    dataSrc: 'values',
    defaultValue: 'small',
    data: {
      values: sizes.filter((size) => options.values.includes(size.label)),
    },
  };
};

export default editFormTitleSizeField;
