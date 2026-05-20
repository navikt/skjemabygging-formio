import type { Component } from '../../../models';
import {
  checkCondition,
  clone,
  createComponent,
  createConditionInstance,
  createForm,
  createParentInstance,
} from './testUtils';

describe('checkCondition simple conditionals', () => {
  it('evaluates legacy simple conditionals locally without Formio runtime', () => {
    const controllingQuestion = createComponent({
      key: 'hasDetails',
      type: 'radiopanel',
    });
    const component = createComponent({
      key: 'details',
      conditional: {
        show: true,
        when: 'hasDetails',
        eq: 'ja',
      },
    });
    const form = createForm([controllingQuestion, component]);

    expect(checkCondition(component, undefined, { hasDetails: 'ja' }, form)).toBe(true);
    expect(checkCondition(component, undefined, { hasDetails: 'nei' }, form)).toBe(false);
  });

  it('evaluates nested simple conditionals with boolean values and show false', () => {
    const controllingQuestion = createComponent({
      key: 'jegVetIkkeHvaOrganisasjonsnummeretEr',
      type: 'checkbox',
    });
    const component = createComponent({
      key: 'organisasjonsnummerTilEnhetenSomSkalMottaFaktura',
      conditional: {
        show: false,
        when: 'enArbeidsgiverEllerVirksomhet.jegVetIkkeHvaOrganisasjonsnummeretEr',
        eq: true,
      } as unknown as Component['conditional'],
    });
    const form = createForm([
      createComponent({
        key: 'enArbeidsgiverEllerVirksomhet',
        type: 'container',
        components: [controllingQuestion, component],
      }),
    ]);

    expect(
      checkCondition(
        component,
        undefined,
        {
          enArbeidsgiverEllerVirksomhet: {
            jegVetIkkeHvaOrganisasjonsnummeretEr: true,
          },
        },
        form,
      ),
    ).toBe(false);
    expect(
      checkCondition(
        component,
        undefined,
        {
          enArbeidsgiverEllerVirksomhet: {
            jegVetIkkeHvaOrganisasjonsnummeretEr: false,
          },
        },
        form,
      ),
    ).toBe(true);
  });

  it('evaluates simple datagrid conditionals using schema parents when instance is missing', () => {
    const referenceQuestion = createComponent({
      key: 'referenceQuestion',
      type: 'radiopanel',
      navId: 'reference-question',
      id: 'reference-question',
    });
    const dependentQuestion = createComponent({
      key: 'dependentQuestion',
      navId: 'dependent-question',
      id: 'dependent-question',
      conditional: {
        show: true,
        when: 'myDataGrid.referenceQuestion',
        eq: 'ja',
      },
    });
    const form = createForm(
      [
        createComponent({
          key: 'myDataGrid',
          type: 'datagrid',
          navId: 'my-datagrid',
          id: 'my-datagrid',
          components: [referenceQuestion, dependentQuestion],
        }),
      ],
      ['PAPER', 'DIGITAL'],
    );

    const component = clone(dependentQuestion);
    const row = { referenceQuestion: 'ja' };
    const data = {
      myDataGrid: [{ referenceQuestion: 'nei' }],
    };

    expect(checkCondition(component, row, data, form)).toBe(true);
  });

  it('evaluates simple datagrid container conditionals from instance data when row is missing', () => {
    const ageField = createComponent({ key: 'alder' });
    const dependentQuestion = createComponent({
      key: 'oppgiForsikringsselskapNarAlderEr5Ar',
      conditional: {
        show: true,
        when: 'kjaeledyr.egenskaper.alder',
        eq: '5',
      },
    });
    const container = createComponent({
      key: 'egenskaper',
      type: 'container',
      components: [ageField, dependentQuestion],
    });
    const form = createForm([
      createComponent({
        key: 'kjaeledyr',
        type: 'datagrid',
        components: [container],
      }),
    ]);
    const datagridParent = createParentInstance({ key: 'kjaeledyr', type: 'datagrid' });
    const containerParent = createParentInstance({ key: 'egenskaper', type: 'container' }, datagridParent);

    expect(
      checkCondition(
        dependentQuestion,
        undefined,
        {
          kjaeledyr: [{ egenskaper: { alder: '5' } }],
        },
        form,
        createConditionInstance(dependentQuestion, { alder: '5' }, containerParent),
      ),
    ).toBe(true);
    expect(
      checkCondition(
        dependentQuestion,
        undefined,
        {
          kjaeledyr: [{ egenskaper: { alder: '4' } }],
        },
        form,
        createConditionInstance(dependentQuestion, { alder: '4' }, containerParent),
      ),
    ).toBe(false);
  });

  it('evaluates simple datagrid container conditionals from row-scoped data with absolute paths inside containers', () => {
    const ageField = createComponent({ key: 'alder' });
    const dependentQuestion = createComponent({
      key: 'oppgiForsikringsselskapNarAlderEr5Ar',
      conditional: {
        show: true,
        when: 'kjaeledyr.egenskaper.alder',
        eq: '5',
      },
    });
    const container = createComponent({
      key: 'egenskaper',
      type: 'container',
      components: [ageField, dependentQuestion],
    });
    const form = createForm([
      createComponent({
        key: 'kjaeledyr',
        type: 'datagrid',
        components: [container],
      }),
    ]);

    expect(checkCondition(dependentQuestion, { alder: '5' }, {}, form)).toBe(true);
    expect(checkCondition(dependentQuestion, { alder: '4' }, {}, form)).toBe(false);
  });

  it('evaluates simple datagrid conditionals from row-scoped data with absolute paths outside containers', () => {
    const ageField = createComponent({ key: 'alder' });
    const container = createComponent({
      key: 'egenskaper',
      type: 'container',
      components: [ageField],
    });
    const dependentQuestion = createComponent({
      key: 'harDetBlittGjennomfortOyelysing',
      type: 'radiopanel',
      conditional: {
        show: true,
        when: 'kjaeledyr.egenskaper.alder',
        eq: '0',
      },
    });
    const form = createForm([
      createComponent({
        key: 'kjaeledyr',
        type: 'datagrid',
        components: [container, dependentQuestion],
      }),
    ]);

    expect(checkCondition(dependentQuestion, { egenskaper: { alder: '0' } }, {}, form)).toBe(true);
    expect(checkCondition(dependentQuestion, { egenskaper: { alder: '1' } }, {}, form)).toBe(false);
    expect(checkCondition(dependentQuestion, { alder: '0' }, {}, form)).toBe(true);
    expect(checkCondition(dependentQuestion, { alder: '1' }, {}, form)).toBe(false);
    expect(checkCondition(dependentQuestion, { egenskaper: { alder: '0' } }, undefined, form)).toBe(true);
    expect(checkCondition(dependentQuestion, { egenskaper: { alder: '1' } }, undefined, form)).toBe(false);
    expect(checkCondition(dependentQuestion, { alder: '0' }, undefined, form)).toBe(true);
    expect(checkCondition(dependentQuestion, { alder: '1' }, undefined, form)).toBe(false);
  });

  it('evaluates simple datagrid conditionals through array-backed full paths', () => {
    const component = createComponent({
      key: 'tekstfelt3MedNiva',
      conditional: {
        show: true,
        when: 'repeterende.checkbox3repeterende',
        eq: 'true',
      },
    });
    const form = createForm([
      createComponent({
        key: 'repeterende',
        type: 'datagrid',
        components: [createComponent({ key: 'checkbox3repeterende', type: 'checkbox' }), component],
      }),
    ]);

    expect(checkCondition(component, undefined, { repeterende: [{ checkbox3repeterende: true }] }, form)).toBe(true);
    expect(checkCondition(component, undefined, { repeterende: [{ checkbox3repeterende: false }] }, form)).toBe(false);
  });

  it('evaluates simple conditionals for a textfield inside a datagrid inside a container', () => {
    const ageField = createComponent({ key: 'alder' });
    const dependentQuestion = createComponent({
      key: 'oppgiForsikringsselskapNarAlderEr5Ar',
      conditional: {
        show: true,
        when: 'eier.kjaeledyr.alder',
        eq: '5',
      },
    });
    const datagrid = createComponent({
      key: 'kjaeledyr',
      type: 'datagrid',
      components: [ageField, dependentQuestion],
    });
    const outerContainer = createComponent({
      key: 'eier',
      type: 'container',
      components: [datagrid],
    });
    const form = createForm([outerContainer]);
    const outerContainerParent = createParentInstance({ key: 'eier', type: 'container' });
    const datagridParent = createParentInstance({ key: 'kjaeledyr', type: 'datagrid' }, outerContainerParent);

    expect(
      checkCondition(
        dependentQuestion,
        undefined,
        { eier: { kjaeledyr: [{ alder: '5' }] } },
        form,
        createConditionInstance(dependentQuestion, { alder: '5' }, datagridParent),
      ),
    ).toBe(true);
    expect(
      checkCondition(
        dependentQuestion,
        undefined,
        { eier: { kjaeledyr: [{ alder: '4' }] } },
        form,
        createConditionInstance(dependentQuestion, { alder: '4' }, datagridParent),
      ),
    ).toBe(false);
  });

  it('supports object-valued conditionals where eq refers to a property key', () => {
    const component = createComponent({
      key: 'showArbeidsinntektDetails',
      conditional: {
        show: true,
        when: 'finansiering',
        eq: 'arbeidsinntekt',
      },
    });
    const form = createForm([component]);

    expect(checkCondition(component, undefined, { finansiering: { arbeidsinntekt: true } }, form)).toBe(true);
    expect(checkCondition(component, undefined, { finansiering: { arbeidsinntekt: false } }, form)).toBe(false);
  });

  it('supports scoped parent-path lookups that resolve to the current row object', () => {
    const component = createComponent({
      key: 'details',
      conditional: {
        show: true,
        when: 'kjaeledyr.egenskaper',
        eq: 'alder',
      },
    });
    const ageField = createComponent({ key: 'alder', type: 'checkbox' });
    const container = createComponent({
      key: 'egenskaper',
      type: 'container',
      components: [ageField, component],
    });
    const form = createForm([
      createComponent({
        key: 'kjaeledyr',
        type: 'datagrid',
        components: [container],
      }),
    ]);
    const datagridParent = createParentInstance({ key: 'kjaeledyr', type: 'datagrid' });
    const containerParent = createParentInstance({ key: 'egenskaper', type: 'container' }, datagridParent);

    expect(
      checkCondition(
        component,
        undefined,
        {
          kjaeledyr: [{ egenskaper: { alder: false } }],
        },
        form,
        createConditionInstance(component, { alder: true }, containerParent),
      ),
    ).toBe(true);
  });

  it('falls back to nested form data paths when a simple conditional uses a bare key', () => {
    const ageField = createComponent({ key: 'alder' });
    const nestedContainer = createComponent({
      key: 'person',
      type: 'container',
      components: [ageField],
    });
    const component = createComponent({
      key: 'details',
      conditional: {
        show: true,
        when: 'alder',
        eq: '5',
      },
    });
    const form = createForm([nestedContainer, component]);

    expect(checkCondition(component, undefined, { person: { alder: '5' } }, form)).toBe(true);
    expect(checkCondition(component, undefined, { person: { alder: '4' } }, form)).toBe(false);
  });
});
