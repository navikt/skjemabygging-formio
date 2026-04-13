import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { fallbackShape } from './componentShapes/fallback';
import { addressShape, identityShape, phoneNumberShape, senderShape } from './componentShapes/structuredValues';
import { JsonSchema, SchemaGenerationContext } from './types';
import { toOptionalInteger, toOptionalNumber } from './validation';

const stringComponentTypes = new Set([
  'currency',
  'date',
  'datepicker',
  'day',
  'email',
  'firstName',
  'iban',
  'landvelger',
  'monthPicker',
  'navDatepicker',
  'orgNr',
  'password',
  'select',
  'navSelect',
  'surname',
  'textarea',
  'textfield',
  'time',
  'valutavelger',
]);

const numberComponentTypes = new Set(['number']);
const booleanComponentTypes = new Set(['checkbox', 'navCheckbox']);
const enumComponentTypes = new Set(['attachment', 'radio', 'radiopanel', 'select', 'navSelect']);
const objectOfBooleanTypes = new Set(['selectboxes']);

const withCommonValidation = (component: Component, schema: JsonSchema): JsonSchema => {
  const minimum = toOptionalNumber(component.validate?.min);
  const maximum = toOptionalNumber(component.validate?.max);
  const minLength = toOptionalInteger(component.validate?.minLength);
  const maxLength = toOptionalInteger(component.validate?.maxLength);

  return {
    ...schema,
    ...(minimum !== undefined ? { minimum } : {}),
    ...(maximum !== undefined ? { maximum } : {}),
    ...(minLength !== undefined ? { minLength } : {}),
    ...(maxLength !== undefined ? { maxLength } : {}),
    ...(component.validate?.pattern ? { pattern: component.validate.pattern } : {}),
  };
};

const valuesToEnum = (component: Component) => {
  if (component.type === 'attachment') {
    const attachmentValues = component.attachmentValues;

    if (!attachmentValues) {
      return undefined;
    }

    const enabledValues = Object.entries(attachmentValues)
      .filter(([, value]) => value?.enabled === true)
      .map(([key]) => key);

    return enabledValues.length ? enabledValues : undefined;
  }

  const options = component.data?.values || component.values;

  return options?.length ? options.map((value) => value.value) : undefined;
};

const inferValueSchema = (component: Component, context: SchemaGenerationContext): JsonSchema => {
  if (component.type === 'phoneNumber') {
    return phoneNumberShape(component);
  }

  if (component.type === 'navAddress') {
    return addressShape(component);
  }

  if (component.type === 'identity') {
    return identityShape(component);
  }

  if (component.type === 'fnrfield') {
    return withCommonValidation(component, {
      type: 'string',
      title: component.label,
    });
  }

  if (component.type === 'sender') {
    return senderShape(component);
  }

  if (objectOfBooleanTypes.has(component.type)) {
    return {
      type: 'object',
      title: component.label,
      properties: Object.fromEntries(
        (component.data?.values || component.values || []).map((value) => [
          value.value,
          { type: 'boolean', title: value.label },
        ]),
      ),
      additionalProperties: false,
    };
  }

  if (enumComponentTypes.has(component.type)) {
    return withCommonValidation(component, {
      type: 'string',
      title: component.label,
      ...(valuesToEnum(component) ? { enum: valuesToEnum(component) } : {}),
      ...(component.type === 'email' ? { format: 'email' } : {}),
      ...(component.type === 'datepicker' || component.type === 'navDatepicker' ? { format: 'date' } : {}),
    });
  }

  if (booleanComponentTypes.has(component.type)) {
    return { type: 'boolean', title: component.label };
  }

  if (numberComponentTypes.has(component.type)) {
    return withCommonValidation(component, {
      type: 'number',
      title: component.label,
    });
  }

  if (stringComponentTypes.has(component.type)) {
    return withCommonValidation(component, {
      type: 'string',
      title: component.label,
      ...(component.type === 'email' ? { format: 'email' } : {}),
      ...(component.type === 'datepicker' || component.type === 'navDatepicker' ? { format: 'date' } : {}),
    });
  }

  return fallbackShape(component, context);
};

export { inferValueSchema };
