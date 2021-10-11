import {findDependentComponents, flattenComponents, formMatcherPredicate, toFormPath} from "./navFormUtils";
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
        const actual = findDependentComponents("ec464ka", formWithSimpleConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents("ekoo75nf", formWithSimpleConditional);
        const expected = [expect.objectContaining({key: "oppgiYndlingsfarge"})];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

    });

    describe('A form where one component has a custom conditional', () => {

      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents("e794rrs", formWithCustomConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents("ekoo75nf", formWithCustomConditional);
        const expected = [expect.objectContaining({key: "oppgiYndlingsfarge"})];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

    });

    describe('A form where one component has a conditional json statement', () => {

      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents("eru3e0l", formWithJsonConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents("ekoo75nf", formWithJsonConditional);
        const expected = [expect.objectContaining({key: "oppgiYndlingsfarge"})];
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
        expect(actual).toHaveLength(expected.length);
      });

    });

    function conditional({show = null, when = null, eq = "", json = ""}) {
      return { show, when, eq, json };
    }

    describe('A form with conditional json and partial overlapping component key names', () => {

      const FRUKT_ID = "1";
      const testformWithConditional = conditional => ({
        components: [
          {key: "frukt", id: FRUKT_ID},
          {key: "nedfallsfrukt", id: "2"},
          {key: "fruktsaft", id: "3"},
          {
            key: "oppsummering",
            id: "4",
            conditional,
          }
        ]
      });

      it('Returns exact match of component key', () => {
        const form = testformWithConditional({json: {"===": [{"var": "data.frukt"}, "ja"]}});
        const actual = findDependentComponents(FRUKT_ID, form);
        const expected = [expect.objectContaining({key: "oppsummering"})];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
      });

      it('Ignores partial hit where key in conditional ends with given key', () => {
        const form = testformWithConditional({json: {"===": [{"var": "data.nedfallsfrukt"}, "ja"]}});
        expect(findDependentComponents(FRUKT_ID, form)).toHaveLength(0);
      });

      it('Ignores partial hit where key in conditional starts with given key', () => {
        const form = testformWithConditional({json: {"===": [{"var": "data.fruktsaft"}, "ja"]}});
        expect(findDependentComponents(FRUKT_ID, form)).toHaveLength(0);
      });

    });

    describe('A form with a container containing a component with same key as component outside container', () => {

      const CONTAINER = {id: "1", key: "mycontainer"};
      const MYTEXTFIELD_INSIDE_CONTAINER = {id: "2", key: "mytextfield"};
      const MYTEXTFIELD_OUTSIDE_CONTAINER = {id: "3", key: "mytextfield"};
      const COMPONENT_WITH_CONDITIONAL = {id: "4", key: "summary"};

      const testform = conditional => {
        return ({
          components: [
            {
              key: CONTAINER.key,
              type: "container",
              id: CONTAINER.id,
              components: [
                {key: MYTEXTFIELD_INSIDE_CONTAINER.key, type: "textfield", id: MYTEXTFIELD_INSIDE_CONTAINER.id}
              ]
            },
            {key: MYTEXTFIELD_OUTSIDE_CONTAINER.key, type: "textfield", id: MYTEXTFIELD_OUTSIDE_CONTAINER.id},
            {
              key: COMPONENT_WITH_CONDITIONAL.key,
              id: COMPONENT_WITH_CONDITIONAL.id,
              conditional,
            }
          ]
        });
      };

      it('Returns dependent component for textfield inside container', () => {
        const form = testform(conditional({show: "true", when: "mycontainer.mytextfield", eq: "yeah"}));
        const actual = findDependentComponents(MYTEXTFIELD_INSIDE_CONTAINER.id, form);
        const expected = [expect.objectContaining({key: COMPONENT_WITH_CONDITIONAL.key})];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
      });

      it('Returns dependent component for containter containing textfield', () => {
        const form = testform(conditional({show: "true", when: "mycontainer.mytextfield", eq: "yeah"}));
        const actual = findDependentComponents(CONTAINER.id, form);
        const expected = [expect.objectContaining({key: COMPONENT_WITH_CONDITIONAL.key})];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
      });

      it('Returns no dependent component for textfield outside container', () => {
        const form = testform(conditional({show: "true", when: "mycontainer.mytextfield", eq: "yeah"}));
        const actual = findDependentComponents(MYTEXTFIELD_OUTSIDE_CONTAINER.id, form);
        expect(actual).toHaveLength(0);
      });

    });

    describe('A form with a datagrid containing textfield with same key as textfield outside datagrid', () => {

      const DATAGRID = {id: "1", key: "myDataGrid"};
      const MYTEXTFIELD_INSIDE_DATAGRID = {id: "2", key: "mytextfield"};
      const MYTEXTFIELD_OUTSIDE_DATAGRID = {id: "3", key: "mytextfield"};
      const COMPONENT_WITH_CONDITIONAL = {id: "4", key: "summary"};

      const testform = (conditional, customConditional) => {
        return ({
          components: [
            {
              key: DATAGRID.key,
              type: "datagrid",
              tree: true,
              id: DATAGRID.id,
              components: [
                {key: MYTEXTFIELD_INSIDE_DATAGRID.key, type: "textfield", id: MYTEXTFIELD_INSIDE_DATAGRID.id}
              ]
            },
            {key: MYTEXTFIELD_OUTSIDE_DATAGRID.key, type: "textfield", id: MYTEXTFIELD_OUTSIDE_DATAGRID.id},
            {
              key: COMPONENT_WITH_CONDITIONAL.key,
              id: COMPONENT_WITH_CONDITIONAL.id,
              conditional,
              customConditional
            }
          ]
        });
      };

      it('Returns dependent component for textfield inside datagrid for simple conditional', () => {
        const form = testform(conditional({show: "true", when: "myDataGrid.mytextfield", eq: "yeah"}));
        const actual = findDependentComponents(MYTEXTFIELD_INSIDE_DATAGRID.id, form);
        const expected = [expect.objectContaining({key: COMPONENT_WITH_CONDITIONAL.key})];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
      });

      it('Returns dependent component for datagrid when referenced in custom conditional', () => {
        const form = testform(undefined, "show = data.myDataGrid && data.myDataGrid.length > 2");
        const actual = findDependentComponents(DATAGRID.id, form);
        const expected = [expect.objectContaining({key: COMPONENT_WITH_CONDITIONAL.key})];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(
          expect.arrayContaining(expected)
        );
      });

      it('Returns no dependent component for textfield outside datagrid', () => {
        const form = testform(conditional({show: "true", when: "myDataGrid.mytextfield", eq: "yeah"}));
        const actual = findDependentComponents(MYTEXTFIELD_OUTSIDE_DATAGRID.id, form);
        expect(actual).toHaveLength(0);
      });

    });

    describe('A form with multiple conditional dependencies', () => {

      const testForm = formWithMultipleConditionalDependencies;

      it('returns three dependent component keys for \'frukt\'', () => {
        const actual = findDependentComponents("e5wjypl", testForm);
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
        const actual = findDependentComponents("efc5w41", testForm);
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
        expect(findDependentComponents("e0p4b08", testForm)).toHaveLength(0);
        expect(findDependentComponents("enfbr1xh", testForm)).toHaveLength(0);
        expect(findDependentComponents("epr77lc", testForm)).toHaveLength(0);
      });

      it('does not return components downstream to given key', () => {
        const actual = findDependentComponents("e1xrfj", testForm);
        expect(actual).toHaveLength(0);
      })

      it('Returns empty array for unknown key', () => {
        const actual = findDependentComponents("ukjentid", testForm);
        expect(actual).toHaveLength(0);
      });

    });

    describe('A form with group of components with external conditional dependencies', () => {

      const testForms = [formWithSkjemagruppe, formWithPanel, formWithContainer];

      testForms.forEach(testForm => {

        describe(`Grouped with ${testForm.title}`, () => {

          it('returns two dependenct component keys for \'oppgiYndlingsfarge\'', () => {
            const dependentKeys = findDependentComponents("e83xe9j", testForm);
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
            const actual = findDependentComponents("eq4be9", testForm);
            const expected = [expect.objectContaining({key: "alertstripe"})];
            expect(actual).toEqual(
              expect.arrayContaining(expected)
            );
            expect(actual).toHaveLength(expected.length);
          });

          it('returns one dependenct component keys for \'minGruppering\'', () => {
            const actual = findDependentComponents("e34565l", testForm);
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
