import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { applyInitialValuesToSubmission } from './initialSubmissionValues';

const createForm = (components: object[]): Form =>
  ({
    title: 'Test',
    path: 'test',
    properties: {},
    components: [{ key: 'page', type: 'panel', navId: 'page', title: 'Page', components }],
  }) as Form;

describe('applyInitialValuesToSubmission', () => {
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

    const result = applyInitialValuesToSubmission(
      form,
      { data: { dineOpplysninger: { identitet: { identitetsnummer: '03876399856' } } } },
      'nb-NO',
    );

    expect(result?.data).toEqual({
      dineOpplysninger: { identitet: { identitetsnummer: '08842748500' } },
    });
  });

  it('returns the same submission after object prefills have settled in overwrite mode', () => {
    const form = createForm([
      {
        key: 'identity',
        type: 'identity',
        input: true,
        prefillValue: '08842748500',
      },
    ]);
    const settledSubmission = applyInitialValuesToSubmission(form, undefined, 'nb');

    expect(applyInitialValuesToSubmission(form, settledSubmission, 'nb')).toBe(settledSubmission);
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

    expect(applyInitialValuesToSubmission(form, { data: { showExtra: false } }, 'nb')).toEqual({
      data: { showExtra: false },
    });
  });

  it('adds a prefill that activates the component through its own value', () => {
    const form = createForm([
      {
        key: 'hasIdentityNumber',
        type: 'radiopanel',
        input: true,
      },
      {
        key: 'identityNumber',
        type: 'textfield',
        input: true,
        prefillValue: '08842748500',
        customConditional:
          'show = data.hasIdentityNumber === "yes" || (data.identityNumber && !data.hasIdentityNumber);',
      },
    ]);

    expect(applyInitialValuesToSubmission(form, undefined, 'nb')).toEqual({
      data: { identityNumber: '08842748500' },
    });
  });

  it('adds prefills from active pages without rendering them', () => {
    const form = createForm([{ key: 'firstName', type: 'textfield', input: true, prefillValue: 'Ada' }]);

    expect(applyInitialValuesToSubmission(form, undefined, 'nb')).toEqual({ data: { firstName: 'Ada' } });
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

    expect(applyInitialValuesToSubmission(form, activeSubmission, 'nb', { prefillMode: 'missing' })).toBe(
      activeSubmission,
    );
    expect(applyInitialValuesToSubmission(form, hiddenSubmission, 'nb', { prefillMode: 'missing' })).toEqual({
      data: { showExtra: false },
    });
    expect(
      applyInitialValuesToSubmission(form, { data: { showExtra: true } }, 'nb', { prefillMode: 'missing' }),
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

    expect(applyInitialValuesToSubmission(form, undefined, 'nb')).toEqual({
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

    expect(applyInitialValuesToSubmission(form, undefined, 'nb')).toEqual({ data: {} });
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
      applyInitialValuesToSubmission(form, { data: { grid: [{ enabled: true }, { enabled: false }] } }, 'nb'),
    ).toEqual({ data: { grid: [{ enabled: true, extra: 'Prefilled value' }, { enabled: false }] } });
  });

  it('applies authored defaults in their canonical submission shapes', () => {
    const form = createForm([
      { key: 'count', type: 'number', input: true, defaultValue: '0' },
      { key: 'price', type: 'currency', input: true, defaultValue: 0 },
      { key: 'confirmed', type: 'navCheckbox', input: true, defaultValue: false },
      { key: 'choice', type: 'radiopanel', input: true, defaultValue: 'yes' },
      {
        key: 'country',
        type: 'landvelger',
        input: true,
        defaultValue: { label: 'Norge', value: 'NO' },
      },
      {
        key: 'select',
        type: 'select',
        input: true,
        values: [
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ],
        defaultValue: 'two',
      },
      { key: 'options', type: 'selectboxes', input: true, defaultValue: { first: true, second: false } },
      { key: 'documentation', type: 'attachment', input: true, defaultValue: 'leggerVedNaa' },
    ]);

    expect(applyInitialValuesToSubmission(form, { data: {} }, 'nb')?.data).toEqual({
      count: '0',
      price: 0,
      confirmed: false,
      choice: 'yes',
      country: { label: 'Norge', value: 'NO' },
      select: { label: 'Two', value: 'two' },
      options: { first: true, second: false },
      documentation: { key: 'leggerVedNaa' },
    });
  });

  it('preserves an existing answer instead of applying its default', () => {
    const form = createForm([{ key: 'count', type: 'number', input: true, defaultValue: '0' }]);
    const submission = { data: { count: 12 } };

    expect(applyInitialValuesToSubmission(form, submission, 'nb')).toBe(submission);
  });

  it('clears a hidden default and restores it when the component becomes active again', () => {
    const form = createForm([
      { key: 'showExtra', type: 'navCheckbox', input: true },
      {
        key: 'extra',
        type: 'number',
        input: true,
        defaultValue: '0',
        customConditional: 'show = data.showExtra === true;',
      },
    ]);

    expect(applyInitialValuesToSubmission(form, { data: { showExtra: false, extra: 42 } }, 'nb')).toEqual({
      data: { showExtra: false },
    });
    expect(applyInitialValuesToSubmission(form, { data: { showExtra: true } }, 'nb')).toEqual({
      data: { showExtra: true, extra: '0' },
    });
  });

  it('prefers a prefill over an authored default', () => {
    const form = createForm([
      {
        key: 'choice',
        type: 'radiopanel',
        input: true,
        prefillValue: 'prefilled',
        defaultValue: 'default',
      },
    ]);

    expect(applyInitialValuesToSubmission(form, undefined, 'nb')).toEqual({
      data: { choice: 'prefilled' },
    });
  });

  it('applies defaults to active data grid rows', () => {
    const form = createForm([
      {
        key: 'grid',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [
          { key: 'enabled', type: 'navCheckbox', input: true },
          {
            key: 'count',
            type: 'number',
            input: true,
            defaultValue: '0',
            customConditional: 'show = row.enabled === true;',
          },
        ],
      },
    ]);

    expect(
      applyInitialValuesToSubmission(form, { data: { grid: [{ enabled: true }, { enabled: false }] } }, 'nb'),
    ).toEqual({ data: { grid: [{ enabled: true, count: '0' }, { enabled: false }] } });
  });

  it('applies defaults to the implicit first data grid row', () => {
    const form = createForm([
      {
        key: 'grid',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [{ key: 'count', type: 'number', input: true, defaultValue: '0' }],
      },
    ]);

    expect(applyInitialValuesToSubmission(form, { data: {} }, 'nb')).toEqual({
      data: { grid: [{ count: '0' }] },
    });
  });

  it('settles a self-hiding default without changing an already stable submission', () => {
    const form = createForm([
      {
        key: 'toggle',
        type: 'navCheckbox',
        input: true,
        defaultValue: true,
        customConditional: 'show = data.toggle !== true;',
      },
    ]);
    const stableSubmission = { data: {} };

    expect(applyInitialValuesToSubmission(form, stableSubmission, 'nb', { prefillMode: 'missing' })).toBe(
      stableSubmission,
    );
  });
});
