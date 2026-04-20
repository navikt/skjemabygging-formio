import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { JsonSchema } from '../types';
import { toOptionalInteger } from '../validation';

const phoneNumberShape = (component: Component): JsonSchema => {
  const minLength = toOptionalInteger(component.validate?.minLength);
  const maxLength = toOptionalInteger(component.validate?.maxLength);

  return {
    title: component.label,
    oneOf: [
      {
        type: 'string',
        ...(minLength !== undefined ? { minLength } : {}),
        ...(maxLength !== undefined ? { maxLength } : {}),
        ...(component.validate?.pattern ? { pattern: component.validate.pattern } : {}),
      },
      {
        type: 'object',
        properties: {
          areaCode: { type: 'string', title: 'Area code' },
          number: {
            type: 'string',
            title: 'Phone number',
            ...(minLength !== undefined ? { minLength } : {}),
            ...(maxLength !== undefined ? { maxLength } : {}),
            ...(component.validate?.pattern ? { pattern: component.validate.pattern } : {}),
          },
        },
        required: ['number'],
        additionalProperties: false,
      },
    ],
  };
};

const addressShape = (component: Component): JsonSchema => ({
  title: component.label,
  type: 'object',
  properties: {},
  additionalProperties: true,
  $comment: 'Address shape may vary by address subtype and is intentionally permissive.',
});

const identityShape = (component: Component): JsonSchema => ({
  title: component.label,
  type: 'object',
  properties: {
    harDuFodselsnummer: { type: 'string', title: 'Do you have identity number' },
    identitetsnummer: { type: 'string', title: 'Identity number' },
    fodselsdato: { type: 'string', title: 'Birth date' },
  },
  additionalProperties: false,
});

const senderShape = (component: Component): JsonSchema => ({
  title: component.label,
  type: 'object',
  properties: {
    person: {
      type: 'object',
      properties: {
        nationalIdentityNumber: { type: 'string', title: 'National identity number' },
        firstName: { type: 'string', title: 'First name' },
        surname: { type: 'string', title: 'Surname' },
      },
      additionalProperties: true,
    },
    organization: {
      type: 'object',
      properties: {
        organizationNumber: { type: 'string', title: 'Organization number' },
        name: { type: 'string', title: 'Name' },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
  $comment: 'Sender component shape may vary between person and organization senders.',
});

const countrySelectShape = (component: Component): JsonSchema => ({
  title: component.label,
  type: 'object',
  properties: {
    value: { type: 'string', title: 'Country code' },
    label: { type: 'string', title: 'Country label' },
  },
  required: ['value', 'label'],
  additionalProperties: false,
});

export { addressShape, countrySelectShape, identityShape, phoneNumberShape, senderShape };
