import { Component } from '../../../models';
import { TEXTS } from '../../../texts';

const createSurname = (props: Partial<Component> = {}): Component => ({
  type: 'surname',
  key: 'etternavn',
  label: TEXTS.statiske.identity.surname,
  input: true,
  fieldSize: 'input--xxl',
  autocomplete: 'family-name',
  validate: { required: true },
  ...props,
});

export { createSurname };
