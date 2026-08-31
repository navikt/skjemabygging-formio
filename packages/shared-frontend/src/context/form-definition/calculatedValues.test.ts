import { Component, Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { collectDataGridRowScopes } from '../../form-components/components/data-grid/dataGridRows';
import { applyCalculatedValues, collectCalculationTargets } from './calculatedValues';
import { enrichFormWithBaseSubmissionPath } from './formDefinitionUtils';

// Shaped like the data grid "transportmiddelTur" in the production form nav100716, where a currency
// field sums the other amounts in the same row.
const rowSumExpression =
  'value = getFieldValue(row.belopForTog) + getFieldValue(row.belopForFly);\n' +
  'function getFieldValue(fieldValue) {\n  return parseFloat(fieldValue) || 0;\n}';

const createForm = (dataGridComponents: Component[], extraComponents: Component[] = []): Form =>
  enrichFormWithBaseSubmissionPath({
    title: 'Test',
    path: 'test',
    properties: { submissionTypes: ['PAPER'] },
    components: [
      {
        key: 'reisemateOgUtgifter',
        title: 'Reisemåte og utgifter',
        type: 'panel',
        navId: 'panel',
        components: [
          {
            key: 'transportmiddelTur',
            label: 'Transportmiddel',
            type: 'datagrid',
            input: true,
            tree: true,
            navId: 'grid',
            components: dataGridComponents,
          },
          ...extraComponents,
        ],
      },
    ],
  } as unknown as Form);

const dataGridComponents: Component[] = [
  { key: 'belopForTog', label: 'Beløp for tog', type: 'currency', input: true, navId: 'tog' },
  { key: 'belopForFly', label: 'Beløp for fly', type: 'currency', input: true, navId: 'fly' },
  {
    key: 'totaltBelopForReiseTur',
    label: 'Totalt beløp for reisen',
    type: 'currency',
    input: true,
    navId: 'total',
    calculateValue: rowSumExpression,
  },
] as Component[];

const calculate = (form: Form, submission: Submission) =>
  applyCalculatedValues({
    submission,
    formComponents: form.components,
    dataGridRowScopes: collectDataGridRowScopes({ components: form.components, submission, form }),
  });

describe('calculatedValues', () => {
  it('calculates each data grid row with its own row context and indexed submission path', () => {
    const form = createForm(dataGridComponents);
    const submission = {
      data: {
        transportmiddelTur: [
          { belopForTog: 100, belopForFly: 250 },
          { belopForTog: 10, belopForFly: 5 },
        ],
      },
    };

    expect(calculate(form, submission)?.data).toEqual({
      transportmiddelTur: [
        { belopForTog: 100, belopForFly: 250, totaltBelopForReiseTur: 350 },
        { belopForTog: 10, belopForFly: 5, totaltBelopForReiseTur: 15 },
      ],
    });
  });

  it('keeps the data grid rows as an array instead of writing to a shared path', () => {
    const form = createForm(dataGridComponents);
    const result = calculate(form, { data: { transportmiddelTur: [{ belopForTog: 20 }] } });

    expect(Array.isArray(result?.data.transportmiddelTur)).toBe(true);
    expect(
      collectCalculationTargets({
        formComponents: form.components,
        dataGridRowScopes: collectDataGridRowScopes({
          components: form.components,
          submission: { data: { transportmiddelTur: [{}, {}] } },
          form,
        }),
      }).map(({ submissionPath }) => submissionPath),
    ).toEqual(['transportmiddelTur[0].totaltBelopForReiseTur', 'transportmiddelTur[1].totaltBelopForReiseTur']);
  });

  it('converts row values typed as text to numbers before evaluating', () => {
    const form = createForm(dataGridComponents);

    expect(
      calculate(form, { data: { transportmiddelTur: [{ belopForTog: '1 200', belopForFly: '10,5' }] } })?.data,
    ).toEqual({
      transportmiddelTur: [{ belopForTog: '1 200', belopForFly: '10,5', totaltBelopForReiseTur: 1210.5 }],
    });
  });

  it('does not calculate hidden row components', () => {
    const form = createForm([
      ...dataGridComponents.slice(0, 2),
      {
        ...dataGridComponents[2],
        customConditional: 'show = row.belopForTog > 0;',
      },
    ] as Component[]);

    expect(calculate(form, { data: { transportmiddelTur: [{ belopForTog: 0, belopForFly: 5 }] } })?.data).toEqual({
      transportmiddelTur: [{ belopForTog: 0, belopForFly: 5 }],
    });
  });

  it('keeps calculating components outside data grids', () => {
    const form = createForm(dataGridComponents, [
      {
        key: 'antallReiser',
        label: 'Antall reiser',
        type: 'number',
        input: true,
        navId: 'antall',
      },
      {
        key: 'dobbeltAntallReiser',
        label: 'Dobbelt antall reiser',
        type: 'number',
        input: true,
        navId: 'dobbelt',
        calculateValue: 'value = (parseFloat(data.antallReiser) || 0) * 2;',
      },
    ] as Component[]);

    expect(calculate(form, { data: { antallReiser: '3' } })?.data).toEqual({
      antallReiser: '3',
      dobbeltAntallReiser: 6,
    });
  });

  it('calculates the production nav761385 mentor-cost cascade in component order', () => {
    const getFieldValue = `
function getFieldValue(fieldValue) {
 return parseFloat(fieldValue || 0);
}`;
    const form = createForm([], [
      {
        key: 'lonnTilMentoroppgaverIPerioden',
        label: 'Lønn til mentoroppgaver i perioden',
        type: 'currency',
        input: true,
        inputType: 'decimal',
        navId: 'salary',
      },
      {
        key: 'prosentFeriepenger',
        label: 'Prosent feriepenger',
        type: 'number',
        input: true,
        inputType: 'decimal',
        navId: 'holidayRate',
      },
      {
        key: 'feriepenger',
        label: 'Feriepenger',
        type: 'currency',
        input: true,
        readOnly: true,
        navId: 'holidayPay',
        calculateValue: `value = (getFieldValue(data.lonnTilMentoroppgaverIPerioden) * getFieldValue(data.prosentFeriepenger)) /100;${getFieldValue}`,
      },
      {
        key: 'prosentObligatoriskTjenestepensjon',
        label: 'Prosent obligatorisk tjenestepensjon',
        type: 'number',
        input: true,
        inputType: 'decimal',
        navId: 'pensionRate',
      },
      {
        key: 'innskuddTilObligatoriskTjenestepensjon',
        label: 'Innskudd til obligatorisk tjenestepensjon',
        type: 'currency',
        input: true,
        readOnly: true,
        navId: 'pension',
        calculateValue: `value = ((getFieldValue(data.lonnTilMentoroppgaverIPerioden) + getFieldValue(data.feriepenger)) * getFieldValue(data.prosentObligatoriskTjenestepensjon)) /100;${getFieldValue}`,
      },
      {
        key: 'prosentArbeidsgiveravgift',
        label: 'Prosent arbeidsgiveravgift',
        type: 'number',
        input: true,
        inputType: 'decimal',
        navId: 'taxRate',
      },
      {
        key: 'arbeidsgiveravgift',
        label: 'Arbeidsgiveravgift',
        type: 'currency',
        input: true,
        readOnly: true,
        navId: 'tax',
        calculateValue: `value = (getFieldValue(data.lonnTilMentoroppgaverIPerioden)
        + getFieldValue(data.feriepenger)
        + getFieldValue(data.innskuddTilObligatoriskTjenestepensjon))
* getFieldValue(data.prosentArbeidsgiveravgift)
/ 100;${getFieldValue}`,
      },
      {
        key: 'sumBruttoLonnsutgifter',
        label: 'Sum brutto lønnsutgifter',
        type: 'currency',
        input: true,
        readOnly: true,
        navId: 'total',
        calculateValue: `value = getFieldValue(data.lonnTilMentoroppgaverIPerioden)
+ getFieldValue(data.feriepenger)
+ getFieldValue(data.innskuddTilObligatoriskTjenestepensjon)
+ getFieldValue(data.arbeidsgiveravgift);

function getFieldValue(fieldValue) {
 return parseFloat(Math.round(fieldValue) || 0);
}`,
      },
    ] as Component[]);

    expect(
      calculate(form, {
        data: {
          lonnTilMentoroppgaverIPerioden: 1000,
          prosentFeriepenger: 10,
          prosentObligatoriskTjenestepensjon: 2,
          prosentArbeidsgiveravgift: 14.1,
        },
      })?.data,
    ).toMatchObject({
      feriepenger: 100,
      innskuddTilObligatoriskTjenestepensjon: 22,
      arbeidsgiveravgift: 158.202,
      sumBruttoLonnsutgifter: 1280,
    });
  });

  it('returns the same submission when nothing changes', () => {
    const form = createForm(dataGridComponents);
    const submission = {
      data: { transportmiddelTur: [{ belopForTog: 100, belopForFly: 0, totaltBelopForReiseTur: 100 }] },
    };

    expect(calculate(form, submission)).toBe(submission);
  });
});
