import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { JsonSchema } from '../types';

const phoneNumberShape = (component: Component): JsonSchema => ({
  title: component.label,
  oneOf: [
    {
      type: 'string',
      minLength: component.validate?.minLength,
      maxLength: component.validate?.maxLength,
      pattern: component.validate?.pattern,
    },
    {
      type: 'object',
      properties: {
        areaCode: { type: 'string', title: 'Area code' },
        number: {
          type: 'string',
          title: 'Phone number',
          minLength: component.validate?.minLength,
          maxLength: component.validate?.maxLength,
          pattern: component.validate?.pattern,
        },
      },
      required: ['number'],
      additionalProperties: false,
    },
  ],
});

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
    identitetsnummer: { type: 'string', title: 'Identity number' },
    identitetsNummer: { type: 'string', title: 'Identity number' },
    nationalIdentityNumber: { type: 'string', title: 'National identity number' },
  },
  additionalProperties: true,
  $comment: 'Identity component shape may vary between forms and is intentionally permissive.',
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

export { addressShape, identityShape, phoneNumberShape, senderShape };
