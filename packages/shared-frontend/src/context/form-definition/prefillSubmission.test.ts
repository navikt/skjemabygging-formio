import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { applyPrefilledValuesToSubmission } from './prefillSubmission';

const createForm = (components: object[]): Form =>
  ({
    title: 'Test',
    path: 'test',
    properties: {},
    components: [{ key: 'page', type: 'panel', navId: 'page', title: 'Page', components }],
  }) as Form;

describe('applyPrefilledValuesToSubmission', () => {
  it('replaces a resumed identity with prefilled data', () => {
    const form = createForm([
      {
        key: 'dineOpplysninger',
        type: 'container',
        input: true,
        tree: true,
        components: [
          {
            key: 'identitet',
            type: 'identity',
            input: true,
            prefillValue: '08842748500',
          },
        ],
      },
    ]);

    const result = applyPrefilledValuesToSubmission(
      form,
      { data: { dineOpplysninger: { identitet: { identitetsnummer: '03876399856' } } } },
      'nb-NO',
    );

    expect(result?.data).toEqual({
      dineOpplysninger: { identitet: { identitetsnummer: '08842748500' } },
    });
  });

  it('does not add a prefill for a component that is initially hidden', () => {
    const form = createForm([
      { key: 'showExtra', type: 'checkbox', input: true },
      {
        key: 'extra',
        type: 'textfield',
        input: true,
        prefillValue: 'Prefilled value',
        customConditional: 'show = data.showExtra === true;',
      },
    ]);

    expect(applyPrefilledValuesToSubmission(form, { data: { showExtra: false } }, 'nb')).toEqual({
      data: { showExtra: false },
    });
  });

  it('adds prefills from active pages without rendering them', () => {
    const form = createForm([{ key: 'firstName', type: 'textfield', input: true, prefillValue: 'Ada' }]);

    expect(applyPrefilledValuesToSubmission(form, undefined, 'nb')).toEqual({ data: { firstName: 'Ada' } });
  });

  it('clears a hidden value and restores its prefill when it becomes active again', () => {
    const form = createForm([
      { key: 'showExtra', type: 'checkbox', input: true },
      {
        key: 'extra',
        type: 'textfield',
        input: true,
        prefillValue: 'Prefilled value',
        customConditional: 'show = data.showExtra === true;',
      },
    ]);
    const activeSubmission = { data: { showExtra: true, extra: 'User value' } };
    const hiddenSubmission = { data: { showExtra: false, extra: 'User value' } };

    expect(applyPrefilledValuesToSubmission(form, activeSubmission, 'nb', { prefillMode: 'missing' })).toBe(
      activeSubmission,
    );
    expect(applyPrefilledValuesToSubmission(form, hiddenSubmission, 'nb', { prefillMode: 'missing' })).toEqual({
      data: { showExtra: false },
    });
    expect(
      applyPrefilledValuesToSubmission(form, { data: { showExtra: true } }, 'nb', { prefillMode: 'missing' }),
    ).toEqual({ data: { showExtra: true, extra: 'Prefilled value' } });
  });

  it('settles prefilled values that reveal another prefilled component', () => {
    const form = createForm([
      { key: 'showExtra', type: 'radiopanel', input: true, prefillValue: 'yes' },
      {
        key: 'extra',
        type: 'textfield',
        input: true,
        prefillValue: 'Prefilled value',
        customConditional: "show = data.showExtra === 'yes';",
      },
    ]);

    expect(applyPrefilledValuesToSubmission(form, undefined, 'nb')).toEqual({
      data: { showExtra: 'yes', extra: 'Prefilled value' },
    });
  });

  it('never leaves inactive prefills in submission when conditions cannot settle', () => {
    const form = createForm([
      {
        key: 'first',
        type: 'textfield',
        input: true,
        prefillValue: 'Prefilled value',
        customConditional: "show = data.second !== 'Prefilled value';",
      },
      {
        key: 'second',
        type: 'textfield',
        input: true,
        prefillValue: 'Prefilled value',
        customConditional: "show = data.first !== 'Prefilled value';",
      },
    ]);

    expect(applyPrefilledValuesToSubmission(form, undefined, 'nb')).toEqual({ data: {} });
  });

  it('applies prefill values to active data grid rows', () => {
    const form = createForm([
      {
        key: 'grid',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [
          { key: 'enabled', type: 'checkbox', input: true },
          {
            key: 'extra',
            type: 'textfield',
            input: true,
            prefillValue: 'Prefilled value',
            customConditional: 'show = row.enabled === true;',
          },
        ],
      },
    ]);

    expect(
      applyPrefilledValuesToSubmission(form, { data: { grid: [{ enabled: true }, { enabled: false }] } }, 'nb'),
    ).toEqual({ data: { grid: [{ enabled: true, extra: 'Prefilled value' }, { enabled: false }] } });
  });
});
