import {
  enrichComponentsWithNavIds,
  findDependentComponents,
  flattenComponents,
  formMatcherPredicate,
  isEqual,
  isSubmissionMethodAllowed,
  removeComponents,
  removeVedleggspanel,
  toFormPath,
} from './navFormUtils';
import formWithContainer from './testdata/conditional-container';
import formWithCustomConditional from './testdata/conditional-custom';
import formWithCompositeCustomConditional from './testdata/conditional-custom-composite';
import formWithDatagridConditional from './testdata/conditional-datagrid.js';
import formWithJsonConditional from './testdata/conditional-json';
import formWithMultipleConditionalDependencies from './testdata/conditional-multiple-dependencies';
import formWithPanel from './testdata/conditional-panel';
import formWithSimpleConditional from './testdata/conditional-simple';
import formWithSkjemagruppe from './testdata/conditional-skjemagruppe';
import nav100750 from './testdata/nav100750';

const withDifferentModified = {
  ...nav100750,
  properties: { ...nav100750.properties, modified: '2024-03-01T08:13:33.878Z' },
};
const withReOrderedProperties = {
  ...nav100750,
  access: nav100750.access,
  machineName: nav100750.machineName,
  owner: nav100750.owner,
  properties: {
    ...nav100750.properties,
    tema: nav100750.properties.tema,
  },
};

describe('navFormUtils', () => {
  describe('toFormPath', () => {
    it('should create path from skjemanummer', () => {
      expect(toFormPath('NAV 10-13.76')).toBe('nav101376');
    });

    it('should handle øæå', () => {
      expect(toFormPath('ØÆÅ 10-13.76')).toBe('oaea101376');
    });

    it('should create path from title (legacy)', () => {
      expect(
        toFormPath(
          'Erklæring fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy og / eller spesialutstyr og tilpassing',
        ),
      ).toBe('erklaeringfraergoellerfysioterapeutiforbindelsemedsoknadommotorkjoretoyogellerspesialutstyrogtilpassing');
      expect(toFormPath('Søknad om forlenget barnepensjon etter fylte 18 år')).toBe(
        'soknadomforlengetbarnepensjonetterfylte18ar',
      );
      expect(toFormPath('Søknad om utstedelse av attest PD U2')).toBe('soknadomutstedelseavattestpdu2');
      expect(toFormPath('Underveis- og sluttevaluering av AMO-KURS')).toBe('underveisogsluttevalueringavamokurs');
    });
  });

  describe('formMatcherPredicate', () => {
    const createForm = (title, path, skjemanummer) => ({
      title,
      path,
      properties: {
        skjemanummer,
      },
    });

    describe('A form where path is derived from title (legacy)', () => {
      it('should match the path', () => {
        const form = createForm('First test form', 'firsttestform', 'NAV 12-34.56');
        expect(formMatcherPredicate('firsttestform')(form)).toBe(true);
      });

      it('should match the skjemanummer', () => {
        const form = createForm('First test form', 'firsttestform', 'NAV 12-34.56');
        expect(formMatcherPredicate('nav123456')(form)).toBe(true);
      });

      it('should not match other skjemanummer', () => {
        const form = createForm('First test form', 'firsttestform', 'NAV 12-34.56');
        expect(formMatcherPredicate('nav654321')(form)).toBe(false);
      });

      it('should not match other title', () => {
        const form = createForm('First test form', 'firsttestform', 'NAV 12-34.56');
        expect(formMatcherPredicate('secondtestform')(form)).toBe(false);
      });
    });

    describe('A form where the path is derived from skjemanummer', () => {
      it('should match the path', () => {
        const form = createForm('Second test form', 'nav123456', 'NAV 12-34.56');
        expect(formMatcherPredicate('nav123456')(form)).toBe(true);
      });

      it('should match the title (legacy)', () => {
        const form = createForm('Second test form', 'nav123456', 'NAV 12-34.56');
        expect(formMatcherPredicate('secondtestform')(form)).toBe(true);
      });

      it('should not match other skjemanummer', () => {
        const form = createForm('Second test form', 'nav123456', 'NAV 12-34.56');
        expect(formMatcherPredicate('nav654321')(form)).toBe(false);
      });
    });
  });

  describe('flattenComponents', () => {
    it('returns a flat array of all nested components', () => {
      const actual = flattenComponents([
        {
          title: 'Personopplysninger',
          key: 'panel',
          properties: {},
          type: 'panel',
          label: 'Panel',
          components: [
            {
              key: 'fodselsnummerDNummer',
              type: 'fnrfield',
              label: 'Fødselsnummer / D-nummer',
              properties: {},
            },
            {
              label: 'Fornavn',
              type: 'textfield',
              key: 'fornavn',
              properties: {},
            },
          ],
        },
      ]);
      expect(actual.map((component) => component.key)).toEqual(['panel', 'fodselsnummerDNummer', 'fornavn']);
    });
  });

  describe('findDependentComponents', () => {
    describe('A form where one component has a simple conditional on another component', () => {
      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents('ec464ka', formWithSimpleConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents('ekoo75nf', formWithSimpleConditional);
        const expected = [expect.objectContaining({ key: 'oppgiYndlingsfarge' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });
    });

    describe('A form where one component has a custom conditional', () => {
      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents('e794rrs', formWithCustomConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents('ekoo75nf', formWithCustomConditional);
        const expected = [expect.objectContaining({ key: 'oppgiYndlingsfarge' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });
    });

    describe('A form where one component has a custom conditional with dependency to several components', () => {
      it('when given the id of the first component in the conditional it returns the key of the component owning the conditional', () => {
        const actual = findDependentComponents('em5trf1', formWithCompositeCustomConditional);
        const expected = [expect.objectContaining({ key: 'hvisSolbrillerOgSolkremEllerSolseng' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });

      it('when given the id of the second component in the conditional it returns the key of the component owning the conditional', () => {
        const actual = findDependentComponents('eoql8pp', formWithCompositeCustomConditional);
        const expected = [expect.objectContaining({ key: 'hvisSolbrillerOgSolkremEllerSolseng' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });

      it('when given the id of the last component in the conditional it returns the key of the component owning the conditional', () => {
        const actual = findDependentComponents('eo9rcfe', formWithCompositeCustomConditional);
        const expected = [expect.objectContaining({ key: 'hvisSolbrillerOgSolkremEllerSolseng' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });
    });

    describe('component=a inside datagrid with custom conditional referring to component=b inside the same datagrid using row variable', () => {
      it('returns component=a when checking component=b inside the datagrid', () => {
        const actual = findDependentComponents('b', formWithDatagridConditional);
        const expected = [expect.objectContaining({ key: 'sporsmalSomErAvhengigAvReferansesporsmal' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });
    });

    describe('A form where one component has a conditional json statement', () => {
      it('Returns empty array when component has no conditional', () => {
        const actual = findDependentComponents('eru3e0l', formWithJsonConditional);
        expect(actual).toHaveLength(0);
      });

      it('Returns an array with the key of the component it has a conditional on', () => {
        const actual = findDependentComponents('ekoo75nf', formWithJsonConditional);
        const expected = [expect.objectContaining({ key: 'oppgiYndlingsfarge' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });
    });

    function conditional({ show = null, when = null, eq = '', json = '' }) {
      return { show, when, eq, json };
    }

    describe('A form with conditional json and partial overlapping component key names', () => {
      const FRUKT_ID = '1';
      const testformWithConditional = (conditional) => ({
        components: [
          { key: 'frukt', id: FRUKT_ID },
          { key: 'nedfallsfrukt', id: '2' },
          { key: 'fruktsaft', id: '3' },
          {
            key: 'oppsummering',
            id: '4',
            conditional,
          },
        ],
      });

      it('Returns exact match of component key', () => {
        const form = testformWithConditional({ json: { '===': [{ var: 'data.frukt' }, 'ja'] } });
        const actual = findDependentComponents(FRUKT_ID, form);
        const expected = [expect.objectContaining({ key: 'oppsummering' })];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(expect.arrayContaining(expected));
      });

      it('Ignores partial hit where key in conditional ends with given key', () => {
        const form = testformWithConditional({ json: { '===': [{ var: 'data.nedfallsfrukt' }, 'ja'] } });
        expect(findDependentComponents(FRUKT_ID, form)).toHaveLength(0);
      });

      it('Ignores partial hit where key in conditional starts with given key', () => {
        const form = testformWithConditional({ json: { '===': [{ var: 'data.fruktsaft' }, 'ja'] } });
        expect(findDependentComponents(FRUKT_ID, form)).toHaveLength(0);
      });
    });

    describe('A form with a container containing a component with same key as component outside container', () => {
      const CONTAINER = { id: '1', key: 'mycontainer' };
      const MYTEXTFIELD_INSIDE_CONTAINER = { id: '2', key: 'mytextfield' };
      const MYTEXTFIELD_OUTSIDE_CONTAINER = { id: '3', key: 'mytextfield' };
      const COMPONENT_WITH_CONDITIONAL = { id: '4', key: 'summary' };

      const testform = (conditional) => {
        return {
          components: [
            {
              key: CONTAINER.key,
              type: 'container',
              id: CONTAINER.id,
              components: [
                { key: MYTEXTFIELD_INSIDE_CONTAINER.key, type: 'textfield', id: MYTEXTFIELD_INSIDE_CONTAINER.id },
              ],
            },
            { key: MYTEXTFIELD_OUTSIDE_CONTAINER.key, type: 'textfield', id: MYTEXTFIELD_OUTSIDE_CONTAINER.id },
            {
              key: COMPONENT_WITH_CONDITIONAL.key,
              id: COMPONENT_WITH_CONDITIONAL.id,
              conditional,
            },
          ],
        };
      };

      it('Returns dependent component for textfield inside container', () => {
        const form = testform(conditional({ show: 'true', when: 'mycontainer.mytextfield', eq: 'yeah' }));
        const actual = findDependentComponents(MYTEXTFIELD_INSIDE_CONTAINER.id, form);
        const expected = [expect.objectContaining({ key: COMPONENT_WITH_CONDITIONAL.key })];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(expect.arrayContaining(expected));
      });

      it('Returns dependent component for containter containing textfield', () => {
        const form = testform(conditional({ show: 'true', when: 'mycontainer.mytextfield', eq: 'yeah' }));
        const actual = findDependentComponents(CONTAINER.id, form);
        const expected = [expect.objectContaining({ key: COMPONENT_WITH_CONDITIONAL.key })];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(expect.arrayContaining(expected));
      });

      it('Returns no dependent component for textfield outside container', () => {
        const form = testform(conditional({ show: 'true', when: 'mycontainer.mytextfield', eq: 'yeah' }));
        const actual = findDependentComponents(MYTEXTFIELD_OUTSIDE_CONTAINER.id, form);
        expect(actual).toHaveLength(0);
      });
    });

    describe('A form with a datagrid containing textfield with same key as textfield outside datagrid', () => {
      const DATAGRID = { id: '1', key: 'myDataGrid' };
      const MYTEXTFIELD_INSIDE_DATAGRID = { id: '2', key: 'mytextfield' };
      const MYTEXTFIELD_OUTSIDE_DATAGRID = { id: '3', key: 'mytextfield' };
      const COMPONENT_WITH_CONDITIONAL = { id: '4', key: 'summary' };

      const testform = (conditional, customConditional) => {
        return {
          components: [
            {
              key: DATAGRID.key,
              type: 'datagrid',
              tree: true,
              id: DATAGRID.id,
              components: [
                { key: MYTEXTFIELD_INSIDE_DATAGRID.key, type: 'textfield', id: MYTEXTFIELD_INSIDE_DATAGRID.id },
              ],
            },
            { key: MYTEXTFIELD_OUTSIDE_DATAGRID.key, type: 'textfield', id: MYTEXTFIELD_OUTSIDE_DATAGRID.id },
            {
              key: COMPONENT_WITH_CONDITIONAL.key,
              id: COMPONENT_WITH_CONDITIONAL.id,
              conditional,
              customConditional,
            },
          ],
        };
      };

      it('Returns dependent component for textfield inside datagrid for simple conditional', () => {
        const form = testform(conditional({ show: 'true', when: 'myDataGrid.mytextfield', eq: 'yeah' }));
        const actual = findDependentComponents(MYTEXTFIELD_INSIDE_DATAGRID.id, form);
        const expected = [expect.objectContaining({ key: COMPONENT_WITH_CONDITIONAL.key })];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(expect.arrayContaining(expected));
      });

      it('Returns dependent component for datagrid when referenced in custom conditional', () => {
        const form = testform(undefined, 'show = data.myDataGrid && data.myDataGrid.length > 2');
        const actual = findDependentComponents(DATAGRID.id, form);
        const expected = [expect.objectContaining({ key: COMPONENT_WITH_CONDITIONAL.key })];
        expect(actual).toHaveLength(expected.length);
        expect(actual).toEqual(expect.arrayContaining(expected));
      });

      it('Returns no dependent component for textfield outside datagrid', () => {
        const form = testform(conditional({ show: 'true', when: 'myDataGrid.mytextfield', eq: 'yeah' }));
        const actual = findDependentComponents(MYTEXTFIELD_OUTSIDE_DATAGRID.id, form);
        expect(actual).toHaveLength(0);
      });
    });

    describe('A form with multiple conditional dependencies', () => {
      const testForm = formWithMultipleConditionalDependencies;

      it("returns three dependent component keys for 'frukt'", () => {
        const actual = findDependentComponents('e5wjypl', testForm);
        const expected = [
          expect.objectContaining({ key: 'hvorforLikerDuEpler' }),
          expect.objectContaining({ key: 'hvorforLikerDuPaerer' }),
          expect.objectContaining({ key: 'hvorforLikerDuBanan' }),
        ];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });

      it("returns two dependent component keys for 'likerDuFrukt'", () => {
        const actual = findDependentComponents('efc5w41', testForm);
        const expected = [expect.objectContaining({ key: 'alertstripe' }), expect.objectContaining({ key: 'frukt' })];
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual).toHaveLength(expected.length);
      });

      it('returns no dependent keys for components with no conditional', () => {
        expect(findDependentComponents('e0p4b08', testForm)).toHaveLength(0);
        expect(findDependentComponents('enfbr1xh', testForm)).toHaveLength(0);
        expect(findDependentComponents('epr77lc', testForm)).toHaveLength(0);
      });

      it('does not return components downstream to given key', () => {
        const actual = findDependentComponents('e1xrfj', testForm);
        expect(actual).toHaveLength(0);
      });

      it('Returns empty array for unknown key', () => {
        const actual = findDependentComponents('ukjentid', testForm);
        expect(actual).toHaveLength(0);
      });
    });

    describe('A form with group of components with external conditional dependencies', () => {
      const testForms = [formWithSkjemagruppe, formWithPanel, formWithContainer];

      testForms.forEach((testForm) => {
        describe(`Grouped with ${testForm.title}`, () => {
          it("returns two dependenct component keys for 'oppgiYndlingsfarge'", () => {
            const dependentKeys = findDependentComponents('e83xe9j', testForm);
            const actual = [
              expect.objectContaining({ key: 'hvilkenGronnFruktLikerDuBest' }),
              expect.objectContaining({ key: 'hvilkenRodFruktLikerDuBest' }),
            ];
            expect(dependentKeys).toEqual(expect.arrayContaining(actual));
            expect(dependentKeys).toHaveLength(actual.length);
          });

          it("returns one dependenct component keys for 'hvilkenGronnFruktLikerDuBest'", () => {
            const actual = findDependentComponents('eq4be9', testForm);
            const expected = [expect.objectContaining({ key: 'alertstripe' })];
            expect(actual).toEqual(expect.arrayContaining(expected));
            expect(actual).toHaveLength(expected.length);
          });

          it("returns one dependenct component keys for 'minGruppering'", () => {
            const actual = findDependentComponents('e34565l', testForm);
            const expected = [expect.objectContaining({ key: 'alertstripe' })];
            expect(actual).toEqual(expect.arrayContaining(expected));
            expect(actual).toHaveLength(expected.length);
          });
        });
      });
    });
  });

  describe('removeComponent', () => {
    const form = {
      title: 'Testform',
      id: 'abcdef1',
      components: [
        {
          type: 'panel',
          id: 'abcdef2',
          title: 'Veiledning',
          components: [
            {
              type: 'html',
              id: 'abcdef3',
              content: '<p>Fyll ut søknad</p>',
            },
          ],
        },
        {
          type: 'panel',
          id: 'abcdef4',
          title: 'Vedlegg',
          key: 'vedlegsspanel',
          components: [
            {
              type: 'html',
              id: 'abcdef5',
              content: '<p>Tralala</p>',
            },
          ],
        },
      ],
    };

    it('removes vedleggspanel', () => {
      const regex = /.*Vedlegg.*/;
      const actualForm = removeComponents(
        form,
        (component) => component.type === 'panel' && regex.test(component.title),
      );
      expect(actualForm.components).toHaveLength(1);
      expect(actualForm.components[0].title).toBe('Veiledning');
      expect(actualForm.components[0].components).toHaveLength(1);
    });

    it('removes both html components', () => {
      const actualForm = removeComponents(form, (component) => component.type === 'html');
      expect(actualForm.components).toHaveLength(2);
      expect(actualForm.components[0].components).toHaveLength(0);
      expect(actualForm.components[1].components).toHaveLength(0);
    });
  });

  describe('removeVedleggspanel', () => {
    it('removes vedleggspanel with param isAttachmentPanel', () => {
      const actualForm = removeVedleggspanel({
        components: [
          {
            type: 'panel',
            key: 'vedlegg',
            isAttachmentPanel: true,
          },
        ],
      });
      expect(actualForm.components).toHaveLength(0);
    });

    it('do not remove panel with key vedlegg', () => {
      const actualForm = removeVedleggspanel({
        components: [
          {
            type: 'panel',
            key: 'vedlegg',
          },
        ],
      });
      expect(actualForm.components).toHaveLength(1);
    });

    it('do not remove panel with key vedleggpanel', () => {
      const actualForm = removeVedleggspanel({
        components: [
          {
            type: 'panel',
            key: 'vedleggpanel',
          },
        ],
      });
      expect(actualForm.components).toHaveLength(1);
    });

    it('A form with a component that calculates value based on another', () => {
      const formWithComponentsThatCalulateValueBasedOnAnother = {
        id: 'myForm',
        title: 'Form with components that calculate value based on another',
        components: [
          {
            id: 'panel1',
            title: 'Panel 1',
            type: 'panel',
            components: [
              {
                key: 'someCheckbox',
                label: 'Some checkbox',
                type: 'navCheckbox',
                id: 'navCheckbox1',
              },
            ],
          },
          {
            id: 'panel2',
            title: 'Panel 2',
            type: 'panel',
            components: [
              {
                id: 'number1',
                key: 'aComponentThatCalculatesValueBasedOnSomeCheckbox',
                label: 'A component that calculates value based on someCheckbox',
                type: 'number',
                calculateValue: 'value = data.someCheckbox === true ? 1000 : 0',
                readOnly: true,
              },
            ],
          },
        ],
      };
      const actual = findDependentComponents('navCheckbox1', formWithComponentsThatCalulateValueBasedOnAnother);
      expect(actual).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'aComponentThatCalculatesValueBasedOnSomeCheckbox',
          }),
        ]),
      );
    });

    it('A form with a component that validates based on another', () => {
      const formWithComponentsThatValidatesBasedOnAnother = {
        id: 'myForm',
        title: 'Form with components that calculate value based on another',
        components: [
          {
            id: 'panel1',
            title: 'Panel 1',
            type: 'panel',
            components: [
              {
                key: 'someCheckbox',
                label: 'Some checkbox',
                type: 'navCheckbox',
                id: 'navCheckbox1',
              },
            ],
          },
          {
            id: 'panel2',
            title: 'Panel 2',
            type: 'panel',
            components: [
              {
                id: 'radio1',
                key: 'aComponentThatValidatesBasedOnSomeCheckbox',
                label: 'A component that validates based on someCheckbox',
                type: 'radio',
                validate: {
                  custom:
                    "valid = data.someCheckbox === true ? input.a : 'You have to choose A if Some Checkbox is checked",
                },
                readOnly: true,
              },
              {
                id: 'radio2',
                key: 'aComponentThatHasJSONLogicValidationBasedOnSomeCheckbox',
                label: 'A component that validates based on someCheckbox',
                type: 'radio',
                validate: {
                  json: {
                    if: [
                      {
                        '===': [
                          {
                            var: 'data.someCheckbox',
                          },
                          true,
                        ],
                        if: [
                          {
                            '===': [
                              {
                                var: 'input',
                              },
                              'B',
                            ],
                          },
                        ],
                      },
                      true,
                      'You have to choose A if Some Checkbox is checked',
                    ],
                  },
                },
                readOnly: true,
              },
            ],
          },
        ],
      };

      const actual = findDependentComponents('navCheckbox1', formWithComponentsThatValidatesBasedOnAnother);
      expect(actual).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'aComponentThatValidatesBasedOnSomeCheckbox',
          }),
          expect.objectContaining({
            key: 'aComponentThatHasJSONLogicValidationBasedOnSomeCheckbox',
          }),
        ]),
      );
    });
  });

  describe('isSubmissionMethodAllowed', () => {
    const createTestForm = (submissionTypes) => ({ properties: { submissionTypes } });

    describe('submissionTypes=["PAPER"]', () => {
      it('paper is allowed', () => {
        const testform = createTestForm(['PAPER']);
        const allowed = isSubmissionMethodAllowed('paper', testform);
        expect(allowed).toBe(true);
      });

      it('digital is not allowed', () => {
        const testform = createTestForm(['PAPER']);
        const allowed = isSubmissionMethodAllowed('digital', testform);
        expect(allowed).toBe(false);
      });
    });

    describe('submissionTypes=["DIGITAL"]', () => {
      it('paper is not allowed', () => {
        const testform = createTestForm(['DIGITAL']);
        const allowed = isSubmissionMethodAllowed('paper', testform);
        expect(allowed).toBe(false);
      });

      it('digital is allowed', () => {
        const testform = createTestForm(['DIGITAL']);
        const allowed = isSubmissionMethodAllowed('digital', testform);
        expect(allowed).toBe(true);
      });
    });

    describe('submissionTypes=["PAPER", "DIGITAL"]', () => {
      it('paper is allowed', () => {
        const testform = createTestForm(['PAPER', 'DIGITAL']);
        const allowed = isSubmissionMethodAllowed('paper', testform);
        expect(allowed).toBe(true);
      });

      it('digital is allowed', () => {
        const testform = createTestForm(['PAPER', 'DIGITAL']);
        const allowed = isSubmissionMethodAllowed('digital', testform);
        expect(allowed).toBe(true);
      });
    });

    describe('submissionTypes=[]', () => {
      it('paper is not allowed', () => {
        const testform = createTestForm(['DIGITAL']);
        const allowed = isSubmissionMethodAllowed('paper', testform);
        expect(allowed).toBe(false);
      });

      it('digital is not allowed', () => {
        const testform = createTestForm(['PAPER']);
        const allowed = isSubmissionMethodAllowed('digital', testform);
        expect(allowed).toBe(false);
      });
    });
  });

  describe('isEqual', () => {
    it('compares two forms and skips certain properties', () => {
      expect(isEqual(nav100750, withDifferentModified)).toBe(false);
      expect(isEqual(nav100750, withDifferentModified, ['modified'])).toBe(true);
    });

    it('ignores ordering of properties', () => {
      expect(isEqual(nav100750, withReOrderedProperties)).toBe(true);
    });
  });

  describe('enrichComponentsWithNavIds', () => {
    let navIdGenerator;

    beforeEach(() => {
      navIdGenerator = vi.fn();
    });

    it('ignores undefined input', () => {
      const components = enrichComponentsWithNavIds(undefined, navIdGenerator);
      expect(components).toBeUndefined();
      expect(navIdGenerator).toHaveBeenCalledTimes(0);
    });

    it('does not update existing navId', () => {
      const input = [{ navId: '123' }];
      const components = enrichComponentsWithNavIds(input, navIdGenerator);
      expect(components).toEqual([{ navId: '123' }]);
      expect(navIdGenerator).toHaveBeenCalledTimes(0);
    });

    it('updates component with no navId without updating component with valid navId', () => {
      navIdGenerator.mockReturnValueOnce('4444');
      const input = [{ navId: '123' }, {}];
      const components = enrichComponentsWithNavIds(input, navIdGenerator);
      expect(components).toEqual([{ navId: '123' }, { navId: '4444' }]);
      expect(navIdGenerator).toHaveBeenCalledTimes(1);
    });

    it('replaces duplicate navIds', () => {
      navIdGenerator.mockReturnValueOnce('5555');
      const input = [{ navId: '123' }, { navId: '123' }];
      const components = enrichComponentsWithNavIds(input, navIdGenerator);
      expect(components).toEqual([{ navId: '123' }, { navId: '5555' }]);
      expect(navIdGenerator).toHaveBeenCalledTimes(1);
    });

    it('iterates component tree and inserts navId when missing', () => {
      navIdGenerator
        .mockReturnValueOnce('200')
        .mockReturnValueOnce('201')
        .mockReturnValueOnce('202')
        .mockReturnValueOnce('203');
      const input = [
        {
          navId: '100',
          components: [
            {
              components: [{}],
            },
            {
              navId: '101',
            },
          ],
        },
        {
          components: [{}],
        },
      ];
      const components = enrichComponentsWithNavIds(input, navIdGenerator);
      expect(components).toEqual([
        {
          navId: '100',
          components: [
            {
              components: [{ navId: '200' }],
              navId: '201',
            },
            {
              navId: '101',
            },
          ],
        },
        {
          components: [{ navId: '202' }],
          navId: '203',
        },
      ]);
      expect(navIdGenerator).toHaveBeenCalledTimes(4);
    });

    it('iterates component tree and replaces duplicate navIds', () => {
      navIdGenerator
        .mockReturnValueOnce('200')
        .mockReturnValueOnce('201')
        .mockReturnValueOnce('202')
        .mockReturnValueOnce('203');
      const input = [
        {
          navId: '100',
          components: [
            {
              navId: '888',
              components: [{ navId: '102' }, { navId: '999' }, { navId: '999' }],
            },
            {
              navId: '101',
              components: [{ navId: '777' }, { navId: '888' }, { navId: '999' }],
            },
          ],
        },
        {
          navId: '777',
        },
      ];
      const components = enrichComponentsWithNavIds(input, navIdGenerator);
      expect(components).toEqual([
        {
          navId: '100',
          components: [
            {
              navId: '888',
              components: [{ navId: '102' }, { navId: '999' }, { navId: '200' }],
            },
            {
              navId: '101',
              components: [{ navId: '777' }, { navId: '201' }, { navId: '202' }],
            },
          ],
        },
        {
          navId: '203',
        },
      ]);
      expect(navIdGenerator).toHaveBeenCalledTimes(4);
    });

    describe('prop components on components without subcomponents', () => {
      it('is not added when navId is missing', () => {
        navIdGenerator.mockReturnValueOnce('123');
        const input = [{}];
        const components = enrichComponentsWithNavIds(input, navIdGenerator);
        expect(components).toHaveLength(1);
        expect(Object.keys(components[0])).toEqual(['navId']);
      });

      it('is not added when navId is present', () => {
        const input = [{ navId: '1' }];
        const components = enrichComponentsWithNavIds(input, navIdGenerator);
        expect(components).toHaveLength(1);
        expect(Object.keys(components[0])).toEqual(['navId']);
      });
    });
  });
});
