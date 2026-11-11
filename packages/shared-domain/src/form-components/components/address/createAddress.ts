import { Component } from '../../../models';
import { TEXTS } from '../../../texts';

const createAddress = (props: Partial<Component> = {}): Component => ({
  type: 'navAddress',
  key: 'adresse',
  label: TEXTS.statiske.address.address,
  input: true,
  fieldSize: 'input--xxl',
  validate: { required: true },
  ...props,
});

export { createAddress };
