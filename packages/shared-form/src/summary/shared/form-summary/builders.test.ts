import type { Component, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import {
  buildDefaultHtmlSummaryNode,
  buildDefaultListSummaryNode,
  buildDefaultSelectSummaryNode,
  buildDefaultSummaryNode,
} from './builders';

const translate: TranslateFunction = ((text?: string) => (text ? `translated:${text}` : '')) as TranslateFunction;

const createComponent = (overrides: Partial<Component> = {}): Component =>
  ({
    key: 'field',
    label: 'Field label',
    type: 'textfield',
    ...overrides,
  }) as Component;

const createSubmission = (data: Submission['data']): Submission => ({ data });

describe('summary form-summary builders', () => {
  describe('buildDefaultSummaryNode', () => {
    it('returns a translated field node for primitive values', () => {
      const node = buildDefaultSummaryNode({
        component: createComponent(),
        submissionPath: 'field',
        submission: createSubmission({ field: 'hello' }),
        translate,
      });

      expect(node).toEqual({
        type: 'field',
        component: createComponent(),
        submissionPath: 'field',
        key: 'field',
        label: 'translated:Field label',
        description: undefined,
        values: [{ value: 'hello' }],
      });
    });

    it('supports formatting values before building the node', () => {
      const node = buildDefaultSummaryNode({
        component: createComponent(),
        submissionPath: 'field',
        submission: createSubmission({ field: '123456789' }),
        translate,
        valueFormat: (value) => `formatted:${value}`,
      });

      expect(node?.values).toEqual([{ value: 'formatted:123456789' }]);
    });
  });

  describe('buildDefaultListSummaryNode', () => {
    it('maps component values to translated labels', () => {
      const node = buildDefaultListSummaryNode({
        component: createComponent({
          type: 'radiopanel',
          values: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        }),
        submissionPath: 'field',
        submission: createSubmission({ field: 'yes' }),
        translate,
      });

      expect(node?.values).toEqual([{ value: 'translated:Yes' }]);
    });
  });

  describe('buildDefaultSelectSummaryNode', () => {
    it('uses stored select labels from the submission payload', () => {
      const node = buildDefaultSelectSummaryNode({
        component: createComponent({ type: 'navSelect' }),
        submissionPath: 'field',
        submission: createSubmission({ field: { value: '001', label: 'Option label' } }),
        translate,
      });

      expect(node?.values).toEqual([{ value: 'translated:Option label' }]);
    });
  });

  describe('buildDefaultHtmlSummaryNode', () => {
    it('returns translated html content when content should be shown in the summary', () => {
      const node = buildDefaultHtmlSummaryNode({
        component: createComponent({
          type: 'htmlelement',
          textDisplay: 'pdf',
          content: '<p>Hello</p>',
        }),
        submissionPath: 'field',
        translate,
      });

      expect(node?.values).toEqual([{ html: 'translated:<p>Hello</p>' }]);
    });

    it('returns undefined when content is form-only', () => {
      const node = buildDefaultHtmlSummaryNode({
        component: createComponent({
          type: 'htmlelement',
          textDisplay: 'form',
          content: '<p>Hello</p>',
        }),
        submissionPath: 'field',
        translate,
      });

      expect(node).toBeUndefined();
    });
  });
});
