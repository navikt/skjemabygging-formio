import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { inferValueSchema } from './inferValueSchema';

const context = { formPath: 'test-form', revision: 1 };
const createComponent = (type: string, validate: Component['validate'] = { required: true }): Component => ({
  type,
  key: 'value',
  label: 'Value',
  input: true,
  validate,
});

describe('inferValueSchema', () => {
  it('describes currency as a number with configured amount limits', () => {
    expect(inferValueSchema(createComponent('currency', { required: true, min: 0, max: 10000 }), context)).toEqual({
      type: 'number',
      title: 'Value',
      minimum: 0,
      maximum: 10000,
    });
  });

  it('omits empty currency limits', () => {
    expect(
      inferValueSchema(
        createComponent('currency', { required: true, min: '' as unknown as number, max: '' as unknown as number }),
        context,
      ),
    ).toEqual({ type: 'number', title: 'Value' });
  });

  it('describes a year as a four-digit integer', () => {
    expect(inferValueSchema(createComponent('year'), context)).toEqual({
      type: 'integer',
      title: 'Value',
      minimum: 1000,
      maximum: 9999,
    });
  });

  it('uses configured year limits', () => {
    expect(
      inferValueSchema(createComponent('year', { required: true, minYear: 2015, maxYear: 2050 }), context),
    ).toEqual({
      type: 'integer',
      title: 'Value',
      minimum: 2015,
      maximum: 2050,
    });
  });

  it('ignores empty year limits', () => {
    expect(
      inferValueSchema(
        createComponent('year', { required: true, minYear: '' as unknown as number, maxYear: '' as unknown as number }),
        context,
      ),
    ).toEqual({
      type: 'integer',
      title: 'Value',
      minimum: 1000,
      maximum: 9999,
    });
  });

  it('keeps configured year limits within four digits', () => {
    expect(inferValueSchema(createComponent('year', { required: true, minYear: 1, maxYear: 10000 }), context)).toEqual({
      type: 'integer',
      title: 'Value',
      minimum: 1000,
      maximum: 9999,
    });
  });

  it.each([
    ['currency', { type: 'number', title: 'Value', minimum: 0, maximum: 10000 }],
    ['year', { type: 'integer', title: 'Value', minimum: 2015, maximum: 2050 }],
  ])('allows an empty string for optional %s without accepting numeric strings', (type, valueSchema) => {
    expect(
      inferValueSchema(createComponent(type, { min: 0, max: 10000, minYear: 2015, maxYear: 2050 }), context),
    ).toEqual({
      title: 'Value',
      anyOf: [valueSchema, { type: 'string', const: '' }],
    });
  });

  it('describes required address validity with an optional end date', () => {
    expect(inferValueSchema(createComponent('addressValidity', { required: true }), context)).toEqual({
      type: 'object',
      title: 'Value',
      properties: {
        gyldigFraOgMed: { type: 'string', format: 'date' },
        gyldigTilOgMed: {
          anyOf: [
            { type: 'string', format: 'date' },
            { const: '', type: 'string' },
          ],
        },
      },
      required: ['gyldigFraOgMed'],
      additionalProperties: false,
    });
  });

  it('allows empty dates for optional address validity', () => {
    expect(inferValueSchema(createComponent('addressValidity', {}), context)).toEqual({
      type: 'object',
      title: 'Value',
      properties: {
        gyldigFraOgMed: {
          anyOf: [
            { type: 'string', format: 'date' },
            { const: '', type: 'string' },
          ],
        },
        gyldigTilOgMed: {
          anyOf: [
            { type: 'string', format: 'date' },
            { const: '', type: 'string' },
          ],
        },
      },
      additionalProperties: false,
    });
  });
});
