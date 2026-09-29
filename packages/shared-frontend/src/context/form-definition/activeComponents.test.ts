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
  it('evaluates an alert on an attachment panel like any other conditional component', () => {
    const form = createForm([
      {
        key: 'attachments',
        label: 'Attachments',
        type: 'panel',
        isAttachmentPanel: true,
        components: [
          {
            key: 'document',
            label: 'Documentation',
            type: 'attachment',
            input: true,
          },
          {
            key: 'notice',
            label: 'Notice',
            type: 'alertstripe',
            customConditional: 'show = data.document?.value === "ettersender";',
          },
        ],
      },
    ]);
    const document = { attachmentId: 'document', navId: 'document', type: 'default' as const, value: 'ettersender' };
    const submission = { data: { document } };

    expect(getActivePanels(form, { data: {} })[0].components?.map((component) => component.key)).toEqual(['document']);
    expect(getActivePanels(form, submission)[0].components?.map((component) => component.key)).toEqual([
      'document',
      'notice',
    ]);
    document.value = 'harIkke';
    expect(getActivePanels(form, submission)[0].components?.map((component) => component.key)).toEqual(['document']);
  });

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

  it('resolves nested containers relative to their parent, not a matching root key', () => {
    const form = createForm([
      {
        key: 'panel',
        label: 'Panel',
        type: 'panel',
        components: [
          {
            key: 'journey',
            label: 'Journey',
            type: 'container',
            input: true,
            tree: true,
            components: [
              {
                key: 'expenses',
                label: 'Expenses',
                type: 'container',
                input: true,
                tree: true,
                customConditional: 'show = row.useCar === true;',
                components: [
                  {
                    key: 'notice',
                    label: 'Notice',
                    type: 'alertstripe',
                    customConditional: 'show = row.parking > 0 && data.allowExpenses === true;',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
    const getNotices = (parking: number | undefined, rootParking: number) => {
      const [panel] = getActivePanels(form, {
        data: {
          allowExpenses: true,
          useCar: false,
          parking: rootParking,
          expenses: { parking: rootParking },
          journey: {
            useCar: true,
            parking: rootParking,
            expenses: parking === undefined ? undefined : { parking },
          },
        },
      });
      return panel.components?.[0].components?.[0].components?.map((component) => component.key);
    };

    expect(getNotices(100, 0)).toEqual(['notice']);
    expect(getNotices(0, 100)).toEqual([]);
    expect(getNotices(undefined, 100)).toEqual([]);
  });

  it.each(['panel', 'fieldset', 'navSkjemagruppe'])('preserves the enclosing row through a %s', (type) => {
    const form = createForm([
      {
        key: 'panel',
        label: 'Panel',
        type: 'panel',
        components: [
          {
            key: 'expenses',
            label: 'Expenses',
            type: 'container',
            input: true,
            tree: true,
            components: [
              {
                key: 'layout',
                label: 'Layout',
                type,
                input: false,
                components: [
                  {
                    key: 'notice',
                    label: 'Notice',
                    type: 'alertstripe',
                    customConditional: 'show = row.parking > 0;',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
    const getNotices = (parking: number, rootParking: number) =>
      getActivePanels(form, {
        data: { parking: rootParking, expenses: { parking, layout: { parking: rootParking } } },
      })[0].components?.[0].components?.[0].components?.map((component) => component.key);

    expect(getNotices(100, 0)).toEqual(['notice']);
    expect(getNotices(0, 100)).toEqual([]);
  });

  it('keeps root row and data conditions working through layout components', () => {
    const form = createForm([
      {
        key: 'panel',
        label: 'Panel',
        type: 'panel',
        components: [
          {
            key: 'layout',
            label: 'Layout',
            type: 'navSkjemagruppe',
            components: [
              {
                key: 'rowNotice',
                label: 'Row notice',
                type: 'alertstripe',
                customConditional: 'show = row.enabled === true;',
              },
              {
                key: 'dataNotice',
                label: 'Data notice',
                type: 'alertstripe',
                customConditional: 'show = data.enabled === true;',
              },
            ],
          },
        ],
      },
    ]);

    expect(getActivePanels(form, { data: { enabled: true } })[0].components?.[0].components).toHaveLength(2);
    expect(getActivePanels(form, { data: { enabled: false } })[0].components?.[0].components).toEqual([]);
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
