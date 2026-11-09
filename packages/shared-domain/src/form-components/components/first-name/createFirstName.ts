import { Component } from '../../../models';
import { TEXTS } from '../../../texts';

const createFirstName = (props: Partial<Component> = {}): Component => ({
  type: 'firstName',
  key: 'fornavn',
  label: TEXTS.statiske.identity.firstName,
  input: true,
  fieldSize: 'input--xxl',
  autocomplete: 'given-name',
  validate: { required: true },
  ...props,
});

export { createFirstName };
