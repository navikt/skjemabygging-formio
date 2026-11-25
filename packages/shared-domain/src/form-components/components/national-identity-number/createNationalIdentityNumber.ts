import { Component } from '../../../models';
import { TEXTS } from '../../../texts';

const createNationalIdentityNumber = (props: Partial<Component> = {}): Component => ({
  type: 'fnrfield',
  key: 'fodselsnummerDNummer',
  label: TEXTS.statiske.identity.identityNumber,
  input: true,
  fieldSize: 'input--s',
  validate: { required: true },
  ...props,
});

export { createNationalIdentityNumber };
