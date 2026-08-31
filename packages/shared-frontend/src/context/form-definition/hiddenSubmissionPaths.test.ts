import { Form, Panel, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { ComponentDefinition } from '../../form-components/component-types';
import { enrichFormWithBaseSubmissionPath } from './formDefinitionUtils';
import { collectHiddenSubmissionPaths } from './hiddenSubmissionPaths';

const createForm = (components: ComponentDefinition[]): Form =>
  enrichFormWithBaseSubmissionPath({
    title: 'Test',
    path: 'test',
    properties: { submissionTypes: ['PAPER'] },
    components: [
      {
        key: 'panel',
        title: 'Panel',
        type: 'panel',
        navId: 'panel',
        components,
      },
    ],
  } as unknown as Form);

const dataGrid = {
  key: 'kjoreliste',
  label: 'Kjøreliste',
  type: 'datagrid',
  input: true,
  tree: true,
  navId: 'grid',
  components: [
    { key: 'harParkering', label: 'Har parkering', type: 'navCheckbox', input: true, navId: 'harParkering' },
    {
      key: 'parkeringsutgift',
      label: 'Parkeringsutgift',
      type: 'currency',
      input: true,
      navId: 'parkering',
      customConditional: 'show = row.harParkering === true;',
    },
    {
      key: 'beholdes',
      label: 'Beholdes',
      type: 'textfield',
      input: true,
      navId: 'beholdes',
      clearOnHide: false,
      customConditional: 'show = row.harParkering === true;',
    },
  ],
} as unknown as ComponentDefinition;

const collect = (form: Form, submission: Submission) => {
  const activeComponents = form.components as ComponentDefinition[];

  return collectHiddenSubmissionPaths({
    form,
    activeComponents,
    panels: activeComponents as Panel[],
    submission,
  });
};

describe('collectHiddenSubmissionPaths', () => {
  it('clears hidden data grid fields per row using the indexed submission path', () => {
    const form = createForm([dataGrid]);
    const submission = {
      data: {
        kjoreliste: [
          { harParkering: true, parkeringsutgift: 100 },
          { harParkering: false, parkeringsutgift: 250 },
        ],
      },
    };

    expect(collect(form, submission)).toEqual(['kjoreliste[1].parkeringsutgift']);
  });

  it('does not clear row fields with clearOnHide: false', () => {
    const form = createForm([dataGrid]);
    const submission = { data: { kjoreliste: [{ harParkering: false, beholdes: 'beholdt' }] } };

    expect(collect(form, submission)).toEqual(['kjoreliste[0].parkeringsutgift']);
  });

  it('ignores rows that are not objects', () => {
    const form = createForm([dataGrid]);
    const submission = { data: { kjoreliste: [null, { harParkering: false }] } } as unknown as Submission;

    expect(collect(form, submission)).toEqual(['kjoreliste[1].parkeringsutgift']);
  });

  it('never clears the shared, non-indexed path of a data grid child', () => {
    const form = createForm([dataGrid]);
    const submission = { data: { kjoreliste: [{ harParkering: false }] } };

    expect(collect(form, submission)).not.toContain('kjoreliste.parkeringsutgift');
  });

  it('clears hidden fields outside data grids', () => {
    const form = createForm([
      { key: 'synlig', label: 'Synlig', type: 'textfield', input: true, navId: 'synlig' },
      { key: 'skjult', label: 'Skjult', type: 'textfield', input: true, navId: 'skjult' },
    ] as ComponentDefinition[]);
    const [panel] = form.components;
    const activePanel = { ...panel, components: panel.components?.slice(0, 1) } as ComponentDefinition;

    expect(
      collectHiddenSubmissionPaths({
        form,
        activeComponents: [activePanel],
        panels: [activePanel] as Panel[],
        submission: { data: { synlig: 'ja', skjult: 'nei' } },
      }),
    ).toEqual(['skjult']);
  });

  it('clears the hidden production nav100754 service-dog experience answer', () => {
    const form = createForm([
      {
        key: 'harDuHattServicehundTidligere',
        label: 'Har du hatt servicehund tidligere?',
        type: 'radiopanel',
        input: true,
        navId: 'hasHadServiceDog',
      },
      {
        key: 'erfaringMedServicehund',
        label: 'Erfaring med servicehund',
        type: 'navSkjemagruppe',
        input: false,
        clearOnHide: true,
        navId: 'serviceDogExperience',
        conditional: {
          show: true,
          when: 'harDuHattServicehundTidligere',
          eq: 'ja',
        },
        components: [
          {
            key: 'narHaddeDuServicehund2',
            label: 'Når hadde du servicehund?',
            type: 'textarea',
            input: true,
            clearOnHide: true,
            navId: 'whenServiceDog',
          },
        ],
      },
    ] as ComponentDefinition[]);
    const [panel] = form.components;
    const activePanel = { ...panel, components: panel.components?.slice(0, 1) } as ComponentDefinition;

    expect(
      collectHiddenSubmissionPaths({
        form,
        activeComponents: [activePanel],
        panels: [activePanel] as Panel[],
        submission: {
          data: {
            harDuHattServicehundTidligere: 'nei',
            narHaddeDuServicehund2: 'Tidligere svar',
          },
        },
      }),
    ).toEqual(['narHaddeDuServicehund2']);
  });
});
