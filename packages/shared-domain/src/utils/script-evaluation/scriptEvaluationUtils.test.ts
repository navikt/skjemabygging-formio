import type { Component, Form, Submission } from '../../models';
import { checkCondition as formioCheckCondition } from '../formio';
import { scriptEvaluationUtils } from './scriptEvaluationUtils';

const createComponent = (overrides: Partial<Component>) =>
  ({ key: 'field', label: 'Field', type: 'textfield', input: true, navId: 'field-nav', ...overrides }) as Component;

const createForm = (components: Component[], submissionTypes: string[] = ['DIGITAL']) =>
  ({
    skjemanummer: 'TEST',
    path: 'test',
    title: 'Test',
    components,
    properties: { skjemanummer: 'TEST', tema: 'TES', submissionTypes, subsequentSubmissionTypes: [] },
  }) as unknown as Form;

const submission = {
  data: {
    birthDate: '1960-05-17',
    choices: { a: true, b: false },
    list: [{ amount: 1 }, { amount: 5 }],
    radio: 'ja',
    aktiviteter: { aktiviteterOgMaalgruppe: { tiltak: true } },
  },
  metadata: {
    dataFetcher: {
      aktiviteter: { aktiviteterOgMaalgruppe: { data: [{ value: 'tiltak' }] } },
    },
  },
} as unknown as Submission;

const conditions: Array<{ name: string; component: Partial<Component>; submissionTypes?: string[] }> = [
  {
    name: 'utils.isAgeBetween',
    component: { customConditional: "show = utils.isAgeBetween([18, 67], 'birthDate', submission)" },
  },
  {
    name: 'utils.isBornBeforeYear',
    component: { customConditional: "show = utils.isBornBeforeYear(1970, 'birthDate', submission)" },
  },
  {
    name: 'utils.dataFetcher',
    component: {
      customConditional:
        "show = utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).selected('COUNT') > 0",
    },
  },
  { name: '_.some', component: { customConditional: 'show = _.some(data.choices, (value) => value)' } },
  { name: '_.every', component: { customConditional: 'show = _.every(data.list, (row) => row.amount > 2)' } },
  { name: 'instance.isSubmissionDigital', component: { customConditional: 'show = instance.isSubmissionDigital()' } },
  {
    name: 'instance.isSubmissionDigital on paper',
    component: { customConditional: 'show = instance.isSubmissionDigital()' },
    submissionTypes: ['PAPER'],
  },
  { name: 'a missing nested value', component: { customConditional: "show = data.missing.value === 'x'" } },
  { name: 'a script that throws', component: { customConditional: 'show = data.radio.missing()' } },
  { name: 'a simple conditional', component: { conditional: { show: true, when: 'radio', eq: 'ja' } } },
  { name: 'a negated simple conditional', component: { conditional: { show: false, when: 'radio', eq: 'ja' } } },
];

describe('scriptEvaluationUtils.checkCondition', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(conditions)('evaluates $name like the Formio-based checkCondition', ({ component, submissionTypes }) => {
    const target = createComponent(component);
    const form = createForm([target], submissionTypes);

    expect(scriptEvaluationUtils.checkCondition(target, undefined, submission.data, form, undefined, submission)).toBe(
      formioCheckCondition(target, undefined, submission.data, form, undefined, submission),
    );
  });

  it('shows the component when a script uses a Formio util that is not available', () => {
    const target = createComponent({ customConditional: "show = !utils.getRandomComponentId().startsWith('e')" });
    const form = createForm([target]);

    expect(formioCheckCondition(target, undefined, submission.data, form, undefined, submission)).toBe(false);
    expect(scriptEvaluationUtils.checkCondition(target, undefined, submission.data, form, undefined, submission)).toBe(
      true,
    );
  });
});
