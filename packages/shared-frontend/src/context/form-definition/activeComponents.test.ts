import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { getActivePanels } from './activeComponents';

const createForm = (components: Component[]): Form =>
  ({
    title: 'Test form',
    path: 'test-form',
    components,
    properties: { submissionTypes: ['PAPER', 'DIGITAL'] },
  }) as Form;

describe('activeComponents', () => {
  it('filters inactive panels and descendants while preserving authored order', () => {
    const form = createForm([
      {
        key: 'hiddenPanel',
        type: 'panel',
        navId: 'hidden-panel',
        customConditional: 'show = data.showPanel === true;',
        components: [],
      },
      {
        key: 'visiblePanel',
        type: 'panel',
        navId: 'visible-panel',
        components: [
          { key: 'first', type: 'textfield', input: true, id: 'first-id' },
          {
            key: 'second',
            type: 'textfield',
            input: true,
            navId: 'second-id',
            customConditional: 'show = data.showSecond === true;',
          },
        ],
      },
    ] as Component[]);

    expect(getActivePanels(form, { data: { showPanel: false, showSecond: false } })).toEqual([
      {
        key: 'visiblePanel',
        type: 'panel',
        navId: 'visible-panel',
        components: [{ key: 'first', type: 'textfield', input: true, id: 'first-id', navId: 'first-id' }],
      },
    ]);
  });

  it('evaluates container descendants against the container row', () => {
    const form = createForm([
      {
        key: 'panel',
        type: 'panel',
        components: [
          {
            key: 'person',
            type: 'container',
            input: true,
            tree: true,
            components: [
              { key: 'name', type: 'textfield', input: true },
              {
                key: 'details',
                type: 'textfield',
                input: true,
                customConditional: 'show = row.hasDetails === true;',
              },
            ],
          },
        ],
      },
    ] as Component[]);

    const [panel] = getActivePanels(form, { data: { person: { hasDetails: false } } });
    expect(panel.components?.[0].components?.map((component) => component.key)).toEqual(['name']);
  });

  it('keeps data-grid child templates for row-scoped conditional evaluation', () => {
    const form = createForm([
      {
        key: 'panel',
        type: 'panel',
        components: [
          {
            key: 'rows',
            type: 'datagrid',
            input: true,
            tree: true,
            components: [
              {
                key: 'details',
                type: 'textfield',
                input: true,
                id: 'details-id',
                customConditional: 'show = row.hasDetails === true;',
              },
            ],
          },
        ],
      },
    ] as Component[]);

    const [panel] = getActivePanels(form, { data: { rows: [{ hasDetails: false }] } });
    expect(panel.components?.[0].components).toEqual([
      {
        key: 'details',
        type: 'textfield',
        input: true,
        id: 'details-id',
        navId: 'details-id',
        customConditional: 'show = row.hasDetails === true;',
      },
    ]);
  });

  it('provides submission method and the complete submission to custom conditionals', () => {
    const form = createForm([
      {
        key: 'panel',
        type: 'panel',
        components: [
          {
            key: 'digitalField',
            type: 'textfield',
            input: true,
            customConditional: 'show = instance.isSubmissionDigital() && submission.metadata.source === "draft";',
          },
        ],
      },
    ] as Component[]);
    const submission = { data: {}, metadata: { source: 'draft' } } as never;

    expect(getActivePanels(form, submission, { submissionMethod: 'digital' })[0].components).toHaveLength(1);
    expect(getActivePanels(form, submission, { submissionMethod: 'paper' })[0].components).toHaveLength(0);
  });

  it('distinguishes components with duplicate keys by evaluating each component directly', () => {
    const form = createForm([
      {
        key: 'panel',
        type: 'panel',
        components: [
          {
            key: 'answer',
            type: 'textfield',
            input: true,
            navId: 'hidden-answer',
            customConditional: 'show = false;',
          },
          {
            key: 'answer',
            type: 'textfield',
            input: true,
            navId: 'visible-answer',
            customConditional: 'show = true;',
          },
        ],
      },
    ] as Component[]);

    expect(getActivePanels(form)[0].components?.map((component) => component.navId)).toEqual(['visible-answer']);
  });
});
