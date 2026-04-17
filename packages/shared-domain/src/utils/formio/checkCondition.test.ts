import { Component, NavFormType, Submission } from '../../models';
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

  it('evaluates legacy simple conditionals locally without Formio runtime', () => {
    const controllingQuestion = {
      key: 'hasDetails',
      type: 'radiopanel',
      input: true,
    };
    const component = {
      key: 'details',
      type: 'textfield',
      input: true,
      conditional: {
        show: true,
        when: 'hasDetails',
        eq: 'ja',
      },
    };
    const form = {
      components: [controllingQuestion, component],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    expect(checkCondition(component, undefined, { hasDetails: 'ja' }, form)).toBe(true);
    expect(checkCondition(component, undefined, { hasDetails: 'nei' }, form)).toBe(false);
  });

  it('evaluates production-like nested simple conditionals with boolean values and show false', () => {
    const controllingQuestion = {
      key: 'jegVetIkkeHvaOrganisasjonsnummeretEr',
      type: 'checkbox',
      input: true,
    };
    const component = {
      key: 'organisasjonsnummerTilEnhetenSomSkalMottaFaktura',
      type: 'textfield',
      input: true,
      conditional: {
        show: false,
        when: 'enArbeidsgiverEllerVirksomhet.jegVetIkkeHvaOrganisasjonsnummeretEr',
        eq: true,
      },
    } as unknown as Partial<Component>;
    const form = {
      components: [
        {
          key: 'enArbeidsgiverEllerVirksomhet',
          type: 'container',
          input: true,
          components: [controllingQuestion, component],
        },
      ],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

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

  it('does not hide components for placeholder production conditional objects', () => {
    const component = {
      key: 'placeholderConditional',
      type: 'textfield',
      input: true,
      conditional: {
        show: '',
        when: '',
        eq: '',
        json: '',
      },
    } as unknown as Partial<Component>;
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

  it('evaluates simple datagrid container conditionals from instance data when row is missing', () => {
    const ageField = {
      key: 'alder',
      type: 'textfield',
      input: true,
    };
    const dependentQuestion = {
      key: 'oppgiForsikringsselskapNarAlderEr5Ar',
      type: 'textfield',
      input: true,
      conditional: {
        show: true,
        when: 'kjaeledyr.egenskaper.alder',
        eq: '5',
      },
    };
    const container = {
      key: 'egenskaper',
      type: 'container',
      input: true,
      components: [ageField, dependentQuestion],
    };
    const form = {
      components: [
        {
          key: 'kjaeledyr',
          type: 'datagrid',
          input: true,
          components: [container],
        },
      ],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    const createInstance = (alder: string) =>
      ({
        ...dependentQuestion,
        data: {
          egenskaper: { alder },
        },
        parent: {
          ...container,
          parent: {
            key: 'kjaeledyr',
            type: 'datagrid',
          },
        },
      }) as unknown as NonNullable<Parameters<typeof checkCondition>[4]>;

    expect(
      checkCondition(
        dependentQuestion,
        undefined,
        {
          kjaeledyr: [{ egenskaper: { alder: '5' } }],
        },
        form,
        createInstance('5'),
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
        createInstance('4'),
      ),
    ).toBe(false);
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

    expect(
      checkCondition(component, undefined, submission.data, form, undefined, submission as unknown as Submission),
    ).toBe(true);
  });

  it('supports production custom conditionals using utils.dataFetcher selected count', () => {
    const component = {
      key: 'aktiviteterOgMaalgruppe',
      type: 'textfield',
      input: true,
      customConditional:
        "show = utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).selected('COUNT') > 0",
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
        aktiviteter: {
          aktiviteterOgMaalgruppe: {
            tiltakArbeidsrettetUtredning: true,
            annet: true,
          },
        },
      },
      metadata: {
        dataFetcher: {
          aktiviteter: {
            aktiviteterOgMaalgruppe: {
              data: [{ value: 'tiltakArbeidsrettetUtredning' }, { value: 'annet' }],
            },
          },
        },
      },
    };

    expect(
      checkCondition(component, undefined, submission.data, form, undefined, submission as unknown as Submission),
    ).toBe(true);

    const submissionWithOnlyAnnet = {
      data: {
        aktiviteter: {
          aktiviteterOgMaalgruppe: {
            annet: true,
          },
        },
      },
      metadata: submission.metadata,
    };

    expect(
      checkCondition(
        component,
        undefined,
        submissionWithOnlyAnnet.data,
        form,
        undefined,
        submissionWithOnlyAnnet as unknown as Submission,
      ),
    ).toBe(false);
  });

  it('falls back to data for production-style row custom conditionals without row context', () => {
    const component = {
      key: 'avkryssingsboks1',
      type: 'checkbox',
      input: true,
      customConditional: 'show = row.avkryssingsboks0 === true',
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

    expect(checkCondition(component, undefined, { avkryssingsboks0: true }, form)).toBe(true);
    expect(checkCondition(component, undefined, { avkryssingsboks0: false }, form)).toBe(false);
  });

  it('supports production row-based custom conditionals', () => {
    const component = {
      key: 'identitetsnummer',
      type: 'textfield',
      input: true,
      customConditional:
        'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
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

    expect(
      checkCondition(
        component,
        {
          identitet: {
            harDuFodselsnummer: 'nei',
          },
        },
        {},
        form,
      ),
    ).toBeTruthy();
    expect(
      checkCondition(
        component,
        {
          identitet: {
            harDuFodselsnummer: false,
            identitetsnummer: '12345678910',
          },
        },
        {},
        form,
      ),
    ).toBeTruthy();
    expect(
      checkCondition(
        component,
        {
          identitet: {
            harDuFodselsnummer: 'ja',
            identitetsnummer: '',
          },
        },
        {},
        form,
      ),
    ).toBeFalsy();
  });

  it('supports production custom conditionals using optional chaining', () => {
    const component = {
      key: 'utenlandsarbeidEllerArbeidsinntekt',
      type: 'textfield',
      input: true,
      customConditional:
        'show = (data.skalDuArbeideEllerDriveNaeringIUtlandet === "ja") || (data.hvordanFinansiererDuStudiene?.arbeidsinntekt === true)',
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

    expect(checkCondition(component, undefined, { hvordanFinansiererDuStudiene: { arbeidsinntekt: true } }, form)).toBe(
      true,
    );
    expect(checkCondition(component, undefined, { skalDuArbeideEllerDriveNaeringIUtlandet: 'ja' }, form)).toBe(true);
    expect(checkCondition(component, undefined, {}, form)).toBe(false);
  });

  it('supports production custom conditionals combining row and _.every', () => {
    const component = {
      key: 'barn',
      type: 'textfield',
      input: true,
      customConditional:
        'show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag") || (data.detDuSokerOmForHvertAvBarna.length > 0 && _.every(data.detDuSokerOmForHvertAvBarna, (child) => child.hvaSokerDuOm === "endringAvBarnebidrag"))) && ((row.erDetEndringIDetteBarnetsBosted === "nei") || (row.harBarnetDeltFastBosted1 === "nei"))',
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
    const data = {
      sokerForKunEttBarn: { hvaSokerDuOm: 'annet' },
      detDuSokerOmForHvertAvBarna: [{ hvaSokerDuOm: 'endringAvBarnebidrag' }, { hvaSokerDuOm: 'endringAvBarnebidrag' }],
    };

    expect(checkCondition(component, { erDetEndringIDetteBarnetsBosted: 'nei' }, data, form)).toBe(true);
    expect(
      checkCondition(component, { erDetEndringIDetteBarnetsBosted: 'ja', harBarnetDeltFastBosted1: 'ja' }, data, form),
    ).toBe(false);
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

  it('treats missing collections like lodash in custom conditionals', () => {
    const someComponent = {
      key: 'missingSome',
      label: 'Missing some',
      type: 'textfield',
      input: true,
      customConditional: "show = _.some(data.transportmiddelRetur, (row) => row.harDuBenyttetBilferge === 'ja')",
    };
    const form = {
      components: [someComponent],
      properties: {
        skjemanummer: 'TEST',
        tema: 'TES',
        submissionTypes: ['DIGITAL'],
        subsequentSubmissionTypes: [],
      },
    } as unknown as NavFormType;

    expect(checkCondition(someComponent, undefined, {}, form)).toBe(false);

    const everyComponent = {
      key: 'missingEvery',
      label: 'Missing every',
      type: 'textfield',
      input: true,
      customConditional: 'show = _.every(data.items, (item) => item.done === true)',
    };

    const everyForm = { ...form, components: [everyComponent] } as unknown as NavFormType;

    expect(checkCondition(everyComponent, undefined, {}, everyForm)).toBe(true);
  });

  it('supports object collections in custom conditionals via lodash shim', () => {
    const component = {
      key: 'objectCollection',
      label: 'Object collection',
      type: 'textfield',
      input: true,
      customConditional: "show = _.some(data.children, (child) => child.relation === 'fosterforelder')",
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

    expect(
      checkCondition(
        component,
        undefined,
        { children: { first: { relation: 'forelder' }, second: { relation: 'fosterforelder' } } },
        form,
      ),
    ).toBe(true);
  });
});
