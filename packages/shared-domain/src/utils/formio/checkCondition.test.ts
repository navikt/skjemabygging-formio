import { NavFormType } from '../../models';
import { checkCondition } from './navFormioUtils';

describe('checkCondition', () => {
  it('returns true by default when component has no conditional', () => {
    const component = {
      key: 'plainField',
      type: 'textfield',
      input: true,
    };
    const form = {
      components: [component],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    expect(checkCondition(component, undefined, {}, form)).toBe(true);
  });

  it('evaluates simple datagrid conditionals using schema parents when instance is missing', () => {
    const referenceQuestion = {
      key: 'referenceQuestion',
      type: 'radiopanel',
      input: true,
      navId: 'reference-question',
      id: 'reference-question',
    };
    const dependentQuestion = {
      key: 'dependentQuestion',
      type: 'textfield',
      input: true,
      navId: 'dependent-question',
      id: 'dependent-question',
      conditional: {
        show: true,
        when: 'myDataGrid.referenceQuestion',
        eq: 'ja',
      },
    };
    const form = {
      components: [
        {
          key: 'myDataGrid',
          type: 'datagrid',
          input: true,
          navId: 'my-datagrid',
          id: 'my-datagrid',
          components: [referenceQuestion, dependentQuestion],
        },
      ],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['PAPER', 'DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    const component = JSON.parse(JSON.stringify(dependentQuestion));
    const row = { referenceQuestion: 'ja' };
    const data = {
      myDataGrid: [{ referenceQuestion: 'nei' }],
    };

    expect(checkCondition(component, row, data, form)).toBe(true);
  });

  it('supports custom conditionals using utils and submission outside Formio runtime', () => {
    const component = {
      key: 'ageGate',
      type: 'textfield',
      input: true,
      customConditional: "show = utils.isAgeBetween([18, 130], 'birthDate', submission)",
    };
    const form = {
      components: [component],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;
    const submission = {
      data: {
        birthDate: '2000-01-01',
      },
    };

    expect(checkCondition(component, undefined, submission.data, form, undefined, submission)).toBe(true);
  });

  it('supports custom conditionals that use instance submission helpers without a live instance', () => {
    const component = {
      key: 'digitalOnly',
      type: 'textfield',
      input: true,
      customConditional: 'show = instance.isSubmissionDigital()',
    };
    const form = {
      components: [component],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['PAPER', 'DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    expect(checkCondition(component, undefined, {}, form, undefined, undefined, { submissionMethod: 'digital' })).toBe(
      true,
    );
    expect(checkCondition(component, undefined, {}, form, undefined, undefined, { submissionMethod: 'paper' })).toBe(
      false,
    );
  });

  it('supports _.some and _.every in custom conditionals via lodash shim', () => {
    const component = {
      key: 'summary',
      type: 'textfield',
      input: true,
      customConditional: "show = _.some(data.reise, (r) => r.ttKort === 'ja')",
    };
    const form = {
      components: [component],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    const dataWithMatch = { reise: [{ ttKort: 'nei' }, { ttKort: 'ja' }] };
    const dataWithoutMatch = { reise: [{ ttKort: 'nei' }, { ttKort: 'nei' }] };

    expect(checkCondition(component, undefined, dataWithMatch, form)).toBe(true);
    expect(checkCondition(component, undefined, dataWithoutMatch, form)).toBe(false);

    const everyComponent = {
      key: 'allMatch',
      type: 'textfield',
      input: true,
      customConditional: 'show = _.every(data.items, (i) => i.done === true)',
    };
    const everyForm = {
      components: [everyComponent],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    expect(checkCondition(everyComponent, undefined, { items: [{ done: true }, { done: true }] }, everyForm)).toBe(
      true,
    );
    expect(checkCondition(everyComponent, undefined, { items: [{ done: true }, { done: false }] }, everyForm)).toBe(
      false,
    );
  });
});
