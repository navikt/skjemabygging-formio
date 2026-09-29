import type { Submission } from '../../../models';
import { checkCondition, createComponent, createConditionInstance, createForm, createSubmission } from './testUtils';

describe('checkCondition custom conditionals', () => {
  it('supports custom conditionals using utils and submission outside Formio runtime', () => {
    const component = createComponent({
      key: 'ageGate',
      customConditional: "show = utils.isAgeBetween([18, 130], 'birthDate', submission)",
    });
    const form = createForm([component]);
    const submission = createSubmission({
      birthDate: '2000-01-01',
    });

    expect(checkCondition(component, undefined, submission.data, form, undefined, submission)).toBe(true);
  });

  it('supports production custom conditionals using utils.dataFetcher selected count', () => {
    const component = createComponent({
      key: 'aktiviteterOgMaalgruppe',
      customConditional:
        "show = utils.dataFetcher('aktiviteter.aktiviteterOgMaalgruppe', submission).selected('COUNT') > 0",
    });
    const form = createForm([component]);
    const submission = createSubmission(
      {
        aktiviteter: {
          aktiviteterOgMaalgruppe: {
            tiltakArbeidsrettetUtredning: true,
            annet: true,
          },
        },
      },
      {
        dataFetcher: {
          aktiviteter: {
            aktiviteterOgMaalgruppe: {
              data: [{ value: 'tiltakArbeidsrettetUtredning' }, { value: 'annet' }],
            },
          },
        },
      } as Submission['metadata'],
    );

    expect(checkCondition(component, undefined, submission.data, form, undefined, submission)).toBe(true);

    const submissionWithOnlyAnnet = createSubmission(
      {
        aktiviteter: {
          aktiviteterOgMaalgruppe: {
            annet: true,
          },
        },
      },
      submission.metadata,
    );

    expect(
      checkCondition(component, undefined, submissionWithOnlyAnnet.data, form, undefined, submissionWithOnlyAnnet),
    ).toBe(false);
  });

  it('uses explicit empty row objects for production-style row custom conditionals', () => {
    const component = createComponent({
      key: 'avkryssingsboks1',
      type: 'checkbox',
      customConditional: 'show = row.avkryssingsboks0 === true',
    });
    const form = createForm([component]);

    expect(checkCondition(component, {}, { avkryssingsboks0: true }, form)).toBe(false);
    expect(checkCondition(component, undefined, { avkryssingsboks0: true }, form)).toBe(true);
    expect(checkCondition(component, undefined, { avkryssingsboks0: false }, form)).toBe(false);
  });

  it('falls back to submission data when row context is an empty array', () => {
    const component = createComponent({
      key: 'avkryssingsboks1',
      type: 'checkbox',
      customConditional: 'show = row.avkryssingsboks0 === true',
    });
    const form = createForm([component]);

    expect(checkCondition(component, [], { avkryssingsboks0: true }, form)).toBe(true);
    expect(checkCondition(component, [], { avkryssingsboks0: false }, form)).toBe(false);
  });

  it('falls back to instance data when row context is missing', () => {
    const component = createComponent({
      key: 'instanceRowFallback',
      type: 'checkbox',
      customConditional: 'show = row.avkryssingsboks0 === true',
    });
    const form = createForm([component]);
    const instance = createConditionInstance(component, { avkryssingsboks0: true });

    expect(checkCondition(component, undefined, {}, form, instance)).toBe(true);
    expect(checkCondition(component, [], {}, form, instance)).toBe(true);
  });

  it('supports production row-based custom conditionals', () => {
    const component = createComponent({
      key: 'identitetsnummer',
      customConditional:
        'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
    });
    const form = createForm([component]);

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
    ).toBe(true);
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
    ).toBe(true);
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
    const component = createComponent({
      key: 'utenlandsarbeidEllerArbeidsinntekt',
      customConditional:
        'show = (data.skalDuArbeideEllerDriveNaeringIUtlandet === "ja") || (data.hvordanFinansiererDuStudiene?.arbeidsinntekt === true)',
    });
    const form = createForm([component]);

    expect(checkCondition(component, undefined, { hvordanFinansiererDuStudiene: { arbeidsinntekt: true } }, form)).toBe(
      true,
    );
    expect(checkCondition(component, undefined, { skalDuArbeideEllerDriveNaeringIUtlandet: 'ja' }, form)).toBe(true);
    expect(checkCondition(component, undefined, {}, form)).toBe(false);
  });

  it('supports production custom conditionals combining row and _.every', () => {
    const component = createComponent({
      key: 'barn',
      customConditional:
        'show = ((data.sokerForKunEttBarn.hvaSokerDuOm === "endringAvBarnebidrag") || (data.detDuSokerOmForHvertAvBarna.length > 0 && _.every(data.detDuSokerOmForHvertAvBarna, (child) => child.hvaSokerDuOm === "endringAvBarnebidrag"))) && ((row.erDetEndringIDetteBarnetsBosted === "nei") || (row.harBarnetDeltFastBosted1 === "nei"))',
    });
    const form = createForm([component]);
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
    const component = createComponent({
      key: 'digitalOnly',
      customConditional: 'show = instance.isSubmissionDigital()',
    });
    const form = createForm([component], ['PAPER', 'DIGITAL']);

    expect(checkCondition(component, undefined, {}, form, undefined, undefined, { submissionMethod: 'digital' })).toBe(
      true,
    );
    expect(checkCondition(component, undefined, {}, form, undefined, undefined, { submissionMethod: 'paper' })).toBe(
      false,
    );
  });

  it('uses the outer evaluate function when a provided instance does not define evaluate', () => {
    const component = createComponent({
      key: 'providedInstance',
      customConditional: 'show = data.flag === true',
    });
    const form = createForm([component]);
    const instance = createConditionInstance(component, { flag: true });
    delete instance.evaluate;

    expect(checkCondition(component, undefined, { flag: true }, form, instance)).toBe(true);
  });

  it('treats null custom conditional results as the top-level onError fallback', () => {
    const component = createComponent({
      key: 'nullCustomConditional',
      customConditional: 'show = null',
    });
    const form = createForm([component]);

    expect(checkCondition(component, undefined, {}, form)).toBe(true);
  });

  it('supports _.some and _.every in custom conditionals via lodash shim', () => {
    const component = createComponent({
      key: 'summary',
      customConditional: "show = _.some(data.reise, (r) => r.ttKort === 'ja')",
    });
    const form = createForm([component]);

    expect(checkCondition(component, undefined, { reise: [{ ttKort: 'nei' }, { ttKort: 'ja' }] }, form)).toBe(true);
    expect(checkCondition(component, undefined, { reise: [{ ttKort: 'nei' }, { ttKort: 'nei' }] }, form)).toBe(false);

    const everyComponent = createComponent({
      key: 'allMatch',
      customConditional: 'show = _.every(data.items, (i) => i.done === true)',
    });
    const everyForm = createForm([everyComponent]);

    expect(checkCondition(everyComponent, undefined, { items: [{ done: true }, { done: true }] }, everyForm)).toBe(
      true,
    );
    expect(checkCondition(everyComponent, undefined, { items: [{ done: true }, { done: false }] }, everyForm)).toBe(
      false,
    );
  });

  it('treats missing collections like lodash in custom conditionals', () => {
    const someComponent = createComponent({
      key: 'missingSome',
      customConditional: "show = _.some(data.transportmiddelRetur, (row) => row.harDuBenyttetBilferge === 'ja')",
    });
    const form = createForm([someComponent]);

    expect(checkCondition(someComponent, undefined, {}, form)).toBe(false);

    const everyComponent = createComponent({
      key: 'missingEvery',
      customConditional: 'show = _.every(data.items, (item) => item.done === true)',
    });
    const everyForm = createForm([everyComponent]);

    expect(checkCondition(everyComponent, undefined, {}, everyForm)).toBe(true);
  });

  it('supports object collections in custom conditionals via lodash shim', () => {
    const component = createComponent({
      key: 'objectCollection',
      customConditional: "show = _.some(data.children, (child) => child.relation === 'fosterforelder')",
    });
    const form = createForm([component]);

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
