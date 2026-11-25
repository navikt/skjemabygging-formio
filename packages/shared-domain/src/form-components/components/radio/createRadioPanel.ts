import { Component } from '../../../models';
import { TEXTS } from '../../../texts';

const createRadioPanel = (props: Partial<Component> = {}): Component => ({
  type: 'radiopanel',
  key: 'radiopanel',
  label: 'Radiopanel',
  input: true,
  fieldSize: 'input--xxl',
  values: [
    { value: 'ja', label: TEXTS.common.yes },
    { value: 'nei', label: TEXTS.common.no },
  ],
  validate: { required: true },
  ...props,
});

export { createRadioPanel };
