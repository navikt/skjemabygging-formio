import {
  findDependentComponents,
  formMatcherPredicate,
  toFormPath,
  flattenComponents
} from "./navFormUtils";
import formWithSimpleConditional from "./testdata/conditional-simple";
import formWithCustomConditional from "./testdata/conditional-custom";
import formWithJsonConditional from "./testdata/conditional-json";
import formWithMultipleConditionalDependencies from "./testdata/conditional-multiple-dependencies";
import formWithSkjemagruppe from "./testdata/conditional-skjemagruppe";
import formWithPanel from "./testdata/conditional-panel";
import formWithContainer from "./testdata/conditional-container";

describe('navFormUtils', () => {

  describe('toFormPath', () => {

    it('should create path from skjemanummer', () => {
      expect(toFormPath('NAV 10-13.76')).toEqual('nav101376');
    });

    it('should create path from title (legacy)', () => {
      expect(toFormPath('Erklæring fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy og / eller spesialutstyr og tilpassing'))
        .toEqual('erklaeringfraergoellerfysioterapeutiforbindelsemedsoknadommotorkjoretoyogellerspesialutstyrogtilpassing');
      expect(toFormPath('Søknad om forlenget barnepensjon etter fylte 18 år'))
        .toEqual('soknadomforlengetbarnepensjonetterfylte18ar');
      expect(toFormPath('Søknad om utstedelse av attest PD U2'))
        .toEqual('soknadomutstedelseavattestpdu2');
      expect(toFormPath('Underveis- og sluttevaluering av AMO-KURS'))
        .toEqual('underveisogsluttevalueringavamokurs');
    });

  });

  describe('formMatcherPredicate', () => {

    const createForm = (title, path, skjemanummer) => ({
      title,
      path,
      properties: {
        skjemanummer
      }
    });

    describe('A form where path is derived from title (legacy)', () => {

      const form = createForm(
        'First test form',
        'firsttestform',
        'NAV 12-34.56'
      );

      it('should match the path', () => {
        expect(formMatcherPredicate('firsttestform')(form)).toBe(true);
      });

      it('should match the skjemanummer', () => {
        expect(formMatcherPredicate('nav123456')(form)).toBe(true);
      });

      it('should not match other skjemanummer', () => {
        expect(formMatcherPredicate('nav654321')(form)).toBe(false);
      });

      it('should not match other title', () => {
        expect(formMatcherPredicate('secondtestform')(form)).toBe(false);
      });

    });

    describe('A form where the path is derived from skjemanummer', () => {

      const form = createForm(
        'Second test form',
        'nav123456',
        'NAV 12-34.56'
      );

      it('should match the path', () => {
        expect(formMatcherPredicate('nav123456')(form)).toBe(true);
      });

      it('should match the title (legacy)', () => {
        expect(formMatcherPredicate('secondtestform')(form)).toBe(true);
      });

      it('should not match other skjemanummer', () => {
        expect(formMatcherPredicate('nav654321')(form)).toBe(false);
      });

    });

  });

  describe("flattenComponents", () => {

    it("returns a flat array of all nested components", () => {
      const actual = flattenComponents([
        {
          title: "Personopplysninger",
          key: "panel",
          properties: {},
          type: "panel",
          label: "Panel",
          components: [
            {
              key: "fodselsnummerDNummer",
              type: "fnrfield",
              label: "Fødselsnummer / D-nummer",
              properties: {},
            },
            {
              label: "Fornavn",
              type: "textfield",
              key: "fornavn",
              properties: {},
            },
          ],
        },
      ]);
      expect(actual.map((component) => component.key)).toEqual(["panel", "fodselsnummerDNummer", "fornavn"]);
    });

  });

  describe('findDependentComponents', () => {

    describe('A form where one component has a simple conditional on another component', () => {

      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents("oppgiYndlingsfarge", formWithSimpleConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents("harDuEnYndlingsfarge", formWithSimpleConditional);
        const expected = [expect.objectContaining({key: "oppgiYndlingsfarge"})];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

    });

    describe('A form where one component has a custom conditional', () => {

      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents("oppgiYndlingsfarge", formWithCustomConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents("harDuEnYndlingsfarge", formWithCustomConditional);
        const expected = [expect.objectContaining({key: "oppgiYndlingsfarge"})];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

    });

    describe('A form where one component has a conditional json statement', () => {

      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents("oppgiYndlingsfarge", formWithJsonConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents("harDuEnYndlingsfarge", formWithJsonConditional);
        const expected = [expect.objectContaining({key: "oppgiYndlingsfarge"})];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

    });

    describe('A form with multiple conditional dependencies', () => {

      const testForm = formWithMultipleConditionalDependencies;

      it('returns three dependent component keys for \'frukt\'', () => {
        const actual = findDependentComponents("frukt", testForm);
        const expected = [
          expect.objectContaining({key: "hvorforLikerDuEpler"}),
          expect.objectContaining({key: "hvorforLikerDuPaerer"}),
          expect.objectContaining({key: "hvorforLikerDuBanan"})
        ];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

      it('returns two dependent component keys for \'likerDuFrukt\'', () => {
        const actual = findDependentComponents("likerDuFrukt", testForm);
        const expected = [
          expect.objectContaining({key: "alertstripe"}),
          expect.objectContaining({key: "frukt"})
        ];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

      it('returns no dependent keys for components with no conditional', () => {
        expect(findDependentComponents("hvorforLikerDuEpler", testForm)).toHaveLength(0);
        expect(findDependentComponents("hvorforLikerDuPaerer", testForm)).toHaveLength(0);
        expect(findDependentComponents("hvorforLikerDuBanan", testForm)).toHaveLength(0);
      });

      it('does not return components downstream to given key', () => {
        const actual = findDependentComponents("personopplysninger", testForm);
        expect(actual).toHaveLength(0);
      })

      it('Returns empty array for unknown key', () => {
        const actual = findDependentComponents("ukjentkey", testForm);
        expect(actual).toHaveLength(0);
      });

    });

    describe('A form with group of components with external conditional dependencies', () => {

      const testForms = [formWithSkjemagruppe, formWithPanel, formWithContainer];

      testForms.forEach(testForm => {

        describe(`Grouped with ${testForm.title}`, () => {

          it('returns two dependenct component keys for \'oppgiYndlingsfarge\'', () => {
            const dependentKeys = findDependentComponents("oppgiYndlingsfarge", testForm);
            const actual = [
              expect.objectContaining({key: "hvilkenGronnFruktLikerDuBest"}),
              expect.objectContaining({key: "hvilkenRodFruktLikerDuBest"})
            ];
            expect(dependentKeys).toEqual(
              expect.arrayContaining(actual)
            );
            expect(dependentKeys).toHaveLength(actual.length);
          });

          it('returns one dependenct component keys for \'hvilkenGronnFruktLikerDuBest\'', () => {
            const actual = findDependentComponents("hvilkenGronnFruktLikerDuBest", testForm);
            const expected = [expect.objectContaining({key: "alertstripe"})];
            expect(actual).toEqual(
              expect.arrayContaining(expected)
            );
            expect(actual).toHaveLength(expected.length);
          });

          it('returns one dependenct component keys for \'minGruppering\'', () => {
            const actual = findDependentComponents("minGruppering", testForm);
            const expected = [expect.objectContaining({key: "alertstripe"})];
            expect(actual).toEqual(
              expect.arrayContaining(expected)
            );
            expect(actual).toHaveLength(expected.length);
          });

        });

      });

    });

  });

});
