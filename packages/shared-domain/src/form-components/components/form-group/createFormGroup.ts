import { Component } from '../../../models';

const createFormGroup = (props: Partial<Component> = {}): Component => ({
  type: 'navSkjemagruppe',
  key: 'navSkjemagruppe',
  label: 'Skjemagruppe',
  legend: 'Skjemagruppe',
  backgroundColor: true,
  components: [],
  ...props,
});

export { createFormGroup };
