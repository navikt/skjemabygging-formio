import { checkCondition, Component, Form, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { getConditionInstance } from './conditionInstances';

type ConditionRow = Parameters<typeof checkCondition>[1];
type ConditionData = Parameters<typeof checkCondition>[2];

interface EvaluationContext {
  row?: ConditionRow;
  data?: ConditionData;
  submissionMethod?: SubmissionMethod;
}

const createForm = (components: object[], submissionTypes = ['PAPER', 'DIGITAL']): Form =>
  ({
    title: 'Test',
    path: 'test',
    properties: { submissionTypes },
    components: [{ key: 'page', type: 'panel', navId: 'page', title: 'Page', components }],
  }) as unknown as Form;

const findComponent = (components: Component[] | undefined, navId: string): Component | undefined => {
  for (const component of components ?? []) {
    if (component.navId === navId) {
      return component;
    }
    const match = findComponent(component.components, navId);
    if (match) {
      return match;
    }
  }
  return undefined;
};

const evaluateWithAndWithoutInstance = (
  component: Component,
  form: Form,
  { row = {}, data = {}, submissionMethod }: EvaluationContext = {},
) => {
  const instance = getConditionInstance(component, form, submissionMethod);
  expect(instance).toBeDefined();

  const withoutInstance = checkCondition(component, row, data, form, undefined, undefined, { submissionMethod });
  const withInstance = checkCondition(component, row, data, form, instance, undefined, { submissionMethod });
  expect(withInstance).toBe(withoutInstance);
  return withInstance;
};

const expectExpressionToHold = (
  component: Component,
  form: Form,
  expression: string,
  context: EvaluationContext = {},
) => {
  const evaluate = (customConditional: string) =>
    evaluateWithAndWithoutInstance({ ...component, customConditional }, form, context);

  expect(evaluate(`show = ${expression};`)).toBe(true);
  // A custom conditional that throws shows the component, so the negation proves the expression ran.
  expect(evaluate(`show = !(${expression});`)).toBe(false);
};

const conditional = { customConditional: 'show = true;' };

describe('getConditionInstance', () => {
  it('resolves submission helpers from the submission method or the only submission type', () => {
    const components = [{ key: 'field', type: 'textfield', navId: 'field', ...conditional }];
    const form = createForm(components);
    const digitalForm = createForm(components, ['DIGITAL']);
    const component = findComponent(form.components, 'field')!;
    const helpers =
      "[instance.isSubmissionPaper(), instance.isSubmissionDigital(), instance.isSubmissionNologin()].join(',')";

    expectExpressionToHold(component, form, `${helpers} === 'false,true,false'`, { submissionMethod: 'digital' });
    expectExpressionToHold(component, form, `${helpers} === 'false,false,true'`, {
      submissionMethod: 'digitalnologin',
    });
    expectExpressionToHold(component, form, `${helpers} === 'true,false,false'`, { submissionMethod: 'paper' });
    expectExpressionToHold(component, form, `${helpers} === 'true,false,false'`);
    expectExpressionToHold(component, digitalForm, `${helpers} === 'false,true,false'`);
  });

  it('resolves the component and its parents from the form rather than the evaluated copy', () => {
    const form = createForm([
      {
        key: 'grid',
        type: 'datagrid',
        navId: 'grid',
        components: [
          {
            key: 'details',
            type: 'container',
            navId: 'details',
            components: [{ key: 'amount', type: 'textfield', navId: 'amount', ...conditional }],
          },
        ],
      },
    ]);
    const rowCopy = { ...findComponent(form.components, 'amount')!, baseSubmissionPath: 'grid[1].details' };

    expectExpressionToHold(
      rowCopy,
      form,
      "instance.key === 'amount' && instance.parent.key === 'details' && instance.parent.parent.key === 'grid' && " +
        "instance.parent.parent.parent.key === 'page' && instance.parent.parent.parent.parent === undefined && " +
        'instance.parent.components === undefined',
    );
    expectExpressionToHold(
      rowCopy,
      form,
      "component.baseSubmissionPath === 'grid[1].details' && instance.baseSubmissionPath === undefined",
    );
  });

  it('resolves the first component in depth-first order when navIds repeat', () => {
    const repeated = { key: 'repeated', type: 'textfield', navId: 'repeated', ...conditional };
    const form = createForm([
      { key: 'first', type: 'container', navId: 'first', components: [repeated] },
      { key: 'second', type: 'container', navId: 'second', components: [{ ...repeated }] },
    ]);
    const secondCopy = form.components[0].components![1].components![0];

    expectExpressionToHold(secondCopy, form, "instance.parent.key === 'first'");
  });

  it('evaluates simple data grid conditionals against the row', () => {
    const form = createForm([
      {
        key: 'myDataGrid',
        type: 'datagrid',
        navId: 'my-datagrid',
        components: [
          { key: 'referenceQuestion', type: 'radiopanel', navId: 'reference-question' },
          {
            key: 'dependentQuestion',
            type: 'textfield',
            navId: 'dependent-question',
            conditional: { show: true, when: 'myDataGrid.referenceQuestion', eq: 'ja' },
          },
        ],
      },
    ]);
    const component = findComponent(form.components, 'dependent-question')!;
    const data = { myDataGrid: [{ referenceQuestion: 'nei' }] };

    expect(evaluateWithAndWithoutInstance(component, form, { row: { referenceQuestion: 'ja' }, data })).toBe(true);
    expect(evaluateWithAndWithoutInstance(component, form, { row: { referenceQuestion: 'nei' }, data })).toBe(false);
  });

  it('falls back to the data of the component definition when the row is missing', () => {
    const form = createForm([
      { key: 'withData', type: 'select', navId: 'with-data', data: { flag: true }, ...conditional },
    ]);

    expectExpressionToHold(findComponent(form.components, 'with-data')!, form, 'row.flag === true', { row: [] });
  });

  it('passes the evaluated component and the instance to nested evaluations', () => {
    const form = createForm([{ key: 'nested', type: 'textfield', navId: 'nested', ...conditional }]);

    expectExpressionToHold(
      findComponent(form.components, 'nested')!,
      form,
      'instance.evaluate(\'return component.key === "nested" && instance.key === "nested";\', {}) === true',
    );
  });

  it('leaves the instance to checkCondition when it cannot resolve the component', () => {
    const form = createForm([{ key: 'withNavId', type: 'textfield', navId: 'with-nav-id', ...conditional }]);
    const component = findComponent(form.components, 'with-nav-id')!;

    expect(getConditionInstance({ ...component, key: 'unknown', navId: 'unknown' }, form)).toBeUndefined();
    expect(getConditionInstance({ ...component, navId: undefined }, form)).toBeUndefined();
  });

  it('creates no instance for components without conditionals', () => {
    const form = createForm([{ key: 'plain', type: 'textfield', navId: 'plain' }]);

    expect(getConditionInstance(findComponent(form.components, 'plain')!, form)).toBeUndefined();
  });
});
