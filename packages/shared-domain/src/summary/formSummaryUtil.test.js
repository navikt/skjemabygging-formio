import { flattenComponents } from '../utils/form/navFormUtils';
import formSummaryUtil from './formSummaryUtil';
import MockedComponentObjectForTest from './MockedComponentObjectForTest';
import datoISkjemagruppeIDatagrid from './testdata/datovelger-skjemagruppe-datagrid';
import testformCustomConditional from './testdata/form-alertstripe-cusom-conditional';
import testformContainerConditional from './testdata/form-container-conditional';
import testImgFormCustomConditional from './testdata/form-image-custom-conditional';

const { createFormSummaryObject, handleComponent, mapAndEvaluateConditionals } = formSummaryUtil;

const {
  createDummyContainerElement,
  createDummyContentElement,
  createDummyDataGrid,
  createDummyEmail,
  createDummyHTMLElement,
  createDummyAlertstripe,
  createDummyNavDatepicker,
  createDummyNavSkjemagruppe,
  createDummyRadioPanel,
  createDummyRadioPanelWithNumberValues,
  createDummySelectboxes,
  createDummyImage,
  createDummyTextfield,
  createFormObject,
  createPanelObject,
  createDummyDayComponent,
  createDummyLandvelger,
  createDummyCheckbox,
  createDummyCurrencyField,
  createDummyNumberField,
  createDummyAmountWithCurrency,
  createDummyBankAccountField,
  createDummyOrgNrField,
} = MockedComponentObjectForTest;

const onlyAlertstripes = (comp) => comp.type === 'alertstripe';

const mockedTranslate = (value) => {
  switch (value) {
    case 'Bilde':
      return 'Image';
    case 'Bilde beskrivelse':
      return 'Image description';
    default:
      return value;
  }
};

const dummySubmission = {
  data: {
    email: 'email-verdi',
    tekstfelt: 'tekstfelt-verdi',
  },
};

describe('form summary', () => {
  describe('Map and evaluate conditionals', () => {
    it('evaluates conditional and returns a map', () => {
      const formObject = createFormObject([
        createPanelObject('p1', [
          createDummyRadioPanel(),
          createDummyAlertstripe('Alert1', '', '', { show: true, when: 'radiopanel', eq: 'ja' }, 'navId1'),
          createDummyAlertstripe('Alert2', '', '', { show: false, when: 'radiopanel', eq: 'ja' }, 'navId2'),
        ]),
      ]);
      const data = { radiopanel: 'ja' };
      const submission = { data };

      expect(mapAndEvaluateConditionals(formObject, submission)).toEqual({
        'alert1-navId1': true,
        'alert2-navId2': false,
      });
    });
  });

  describe('Image component with custom conditional', () => {
    it('should not be visible when inputCondition=doNotShowImg', () => {
      const { imgForm, submissionDoNotShowConditionalInput } = testImgFormCustomConditional;

      expect(mapAndEvaluateConditionals(imgForm, submissionDoNotShowConditionalInput)).toEqual({
        'image1-sdh82sz': false,
      });
    });

    it('should display image when inputCondition other value than doNotShowImg', () => {
      const { imgForm, submissionOtherInput, submissionEmptyInput } = testImgFormCustomConditional;
      expect(mapAndEvaluateConditionals(imgForm, submissionOtherInput)).toEqual({ 'image1-sdh82sz': true });
      expect(mapAndEvaluateConditionals(imgForm, submissionEmptyInput)).toEqual({ 'image1-sdh82sz': true });
    });
  });

  describe('When handling component', () => {
    describe('panel', () => {
      it('is ignored if it has no subComponents', () => {
        const actual = handleComponent(createPanelObject(), {}, [], '', mockedTranslate);
        expect(actual.find((component) => component.type === 'panel')).toBeUndefined();
      });

      it("is ignored if subComponents don't have submissions", () => {
        const actual = handleComponent(
          createPanelObject('Panel', [createDummyTextfield(), createDummyEmail(), createDummyRadioPanel()]),
          {},
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'panel')).toBeUndefined();
      });

      it('uses title instead of label', () => {
        const actual = handleComponent(
          createPanelObject('PanelTitle', [createDummyTextfield('TextField')], 'PanelLabel (should not be included)'),
          { data: { textfield: 'textValue' } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([
          {
            label: 'PanelTitle',
            key: 'paneltitle',
            type: 'panel',
            components: [{ label: 'TextField', key: 'textfield', type: 'textfield', value: 'textValue' }],
          },
        ]);
      });
    });

    describe('form fields', () => {
      it('are added with value from submission', () => {
        const actual = handleComponent(createDummyTextfield(), dummySubmission, [], '', mockedTranslate);
        expect(actual).toContainEqual({
          label: 'Tekstfelt',
          key: 'tekstfelt',
          type: 'textfield',
          value: 'tekstfelt-verdi',
        });
      });

      it("are not added if they don't have a submission value", () => {
        const actual = handleComponent(createDummyTextfield(), {}, []);
        expect(actual.find((component) => component.type === 'textfield')).toBeUndefined();
      });
    });

    describe('radiopanel', () => {
      it('is correctly added when using string values', () => {
        const actual = handleComponent(
          createDummyRadioPanel(),
          { data: { radiopanel: 'yes' } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'radiopanel').value).toBe('YES-label');
      });

      it('is correctly added when using string values even though submission data value is a string', () => {
        const actual = handleComponent(
          createDummyRadioPanelWithNumberValues(),
          { data: { radiopanelwithnumbervalues: 40 } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'radiopanel').value).toBe('40-label');
      });
    });

    describe('image', () => {
      it('do not add images', () => {
        const actual = handleComponent(createDummyImage(), {}, [], '', (value) => value);
        expect(actual).toEqual([]);
      });
    });

    describe('content', () => {
      it('is filtered away', () => {
        const actual = handleComponent(createDummyContentElement(), dummySubmission, []);
        expect(actual.find((component) => component.type === 'content')).toBeUndefined();
      });
    });

    describe('htmlelement', () => {
      it('is added if it contains content for PDF', () => {
        const actual = handleComponent(
          createDummyHTMLElement('HTML', '', 'contentForPdf'),
          dummySubmission,
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'htmlelement').value).toBe('contentForPdf');
      });

      it('is filtered out if it has no content for PDF', () => {
        const actual = handleComponent(createDummyHTMLElement(), dummySubmission, [], '', mockedTranslate);
        expect(actual.find((component) => component.type === 'htmlelement')).toBeUndefined();
      });
    });

    describe('Alertstripe', () => {
      it('is added if it contains content for PDF', () => {
        const actual = handleComponent(
          createDummyAlertstripe('HTML', '', 'contentForPdf'),
          dummySubmission,
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'alertstripe').value).toBe('contentForPdf');
      });

      it('is filtered out if it has no content for PDF', () => {
        const actual = handleComponent(createDummyAlertstripe(), dummySubmission, [], '', mockedTranslate);
        expect(actual.find((component) => component.type === 'alertstripe')).toBeUndefined();
      });

      describe('when a mapping of evaluated conditionals is passed to handleComponent', () => {
        it('is ignored if the conditional is false', () => {
          const actual = handleComponent(
            createDummyAlertstripe('Alertstripe with conditional', '', 'contentForPdf', {}, 'navId'),
            dummySubmission,
            [],
            '',
            mockedTranslate,
            { 'alertstripewithconditional-navId': false },
          );
          expect(actual.find((component) => component.type === 'alertstripe')).toBeUndefined();
        });

        it('is added if the conditional is true', () => {
          const actual = handleComponent(
            createDummyAlertstripe('Alertstripe with conditional', '', 'contentForPdf', 'navId'),
            dummySubmission,
            [],
            '',
            mockedTranslate,
            { 'alertstripewithconditional-navId': true },
          );
          expect(actual.find((component) => component.type === 'alertstripe').value).toBe('contentForPdf');
        });
      });
    });

    describe('container', () => {
      it('is never included', () => {
        const actual = handleComponent(createDummyContainerElement(), dummySubmission, [], '', mockedTranslate);
        expect(actual.find((component) => component.type === 'container')).toBeUndefined();
      });

      it('is ignored, and subcomponents that should not be included are also ignored', () => {
        const actual = handleComponent(
          createDummyContainerElement('Container', [createDummyContentElement(), createDummyTextfield()]),
          {},
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'container')).toBeUndefined();
        expect(actual.find((component) => component.type === 'content')).toBeUndefined();
        expect(actual.find((component) => component.type === 'textfield')).toBeUndefined();
      });

      it('is ignored, but subcomponents that should be included are added', () => {
        const actual = handleComponent(
          createDummyContainerElement('Container', [createDummyContentElement(), createDummyTextfield()]),
          { data: { container: dummySubmission.data } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([
          {
            label: 'Tekstfelt',
            key: 'container.tekstfelt',
            type: 'textfield',
            value: 'tekstfelt-verdi',
          },
        ]);
      });

      it('Maps the correct submission value to the correct field', () => {
        const actual = handleComponent(
          createPanelObject('Panel', [
            createDummyTextfield(),
            createDummyContainerElement('Level 1 Container', [
              createDummyTextfield(),
              createDummyContainerElement('Level 2 Container', [createDummyTextfield()]),
            ]),
          ]),
          {
            data: {
              tekstfelt: 'Utenfor container',
              level1container: { tekstfelt: 'Inni container 1', level2container: { tekstfelt: 'Inni container 2' } },
            },
          },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([
          {
            key: 'panel',
            label: 'Panel',
            type: 'panel',
            components: [
              {
                key: 'tekstfelt',
                label: 'Tekstfelt',
                type: 'textfield',
                value: 'Utenfor container',
              },
              {
                key: 'level1container.tekstfelt',
                label: 'Tekstfelt',
                type: 'textfield',
                value: 'Inni container 1',
              },
              {
                key: 'level1container.level2container.tekstfelt',
                label: 'Tekstfelt',
                type: 'textfield',
                value: 'Inni container 2',
              },
            ],
          },
        ]);
      });
    });

    describe('navSkjemagruppe', () => {
      it('is ignored if it has no subcomponents', () => {
        const actual = handleComponent(createDummyNavSkjemagruppe(), {}, [], '', mockedTranslate);
        expect(actual.find((component) => component.type === 'navSkjemagruppe')).toBeUndefined();
      });

      it('uses legend and not label', () => {
        const actual = handleComponent(
          createDummyNavSkjemagruppe('NavSkjemagruppe', [createDummyTextfield()]),
          dummySubmission,
          [],
          '',
          mockedTranslate,
        );
        const actualNavSkjemagruppe = actual.find((component) => component.type === 'navSkjemagruppe');
        expect(actualNavSkjemagruppe).toBeDefined();
        expect(actualNavSkjemagruppe.label).toBe('NavSkjemagruppe-legend');
      });
    });

    describe('Selectboxes', () => {
      it('adds each option that is selected', () => {
        const actual = handleComponent(
          createDummySelectboxes(),
          { data: { selectboxes: { milk: true, bread: false, juice: true } } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([
          {
            label: 'Selectboxes',
            key: 'selectboxes',
            type: 'selectboxes',
            value: ['Milk', 'Juice'],
          },
        ]);
      });

      it('does not add anything if no options are selected', () => {
        const actual = handleComponent(
          createDummySelectboxes(),
          { data: { selectboxes: { milk: false, bread: false, juice: false } } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([]);
      });
    });

    describe('Landvelger', () => {
      it('adds the selected value for old version of landvelger', () => {
        const actual = handleComponent(createDummyLandvelger(), { data: { land: 'Norge' } }, [], '', mockedTranslate);
        expect(actual).toEqual([
          {
            key: 'land',
            type: 'landvelger',
            label: 'Land',
            value: 'Norge',
          },
        ]);
      });

      it('adds the selected value for landvelger where label and value is stored in submission', () => {
        const actual = handleComponent(
          createDummyLandvelger(),
          { data: { land: { value: 'NO', label: 'Norge' } } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([
          {
            key: 'land',
            type: 'landvelger',
            label: 'Land',
            value: 'Norge',
          },
        ]);
      });

      it('does not add anything if no option is selected (old version of landvelger)', () => {
        const actual = handleComponent(createDummyLandvelger(), { data: { land: '' } }, [], '', mockedTranslate);
        expect(actual).toEqual([]);
      });

      it('does not add anything if no option is selected (current version of landvelger)', () => {
        const actual = handleComponent(createDummyLandvelger(), { data: { land: {} } }, [], '', mockedTranslate);
        expect(actual).toEqual([]);
      });
    });

    describe('Checkbox', () => {
      it('does not add anything if not selected', () => {
        const actual = handleComponent(createDummyCheckbox(), { label: { key: '' } }, [], '', mockedTranslate);
        expect(actual).toEqual([]);
      });
    });

    describe('DataGrid', () => {
      it('is ignored if it has no subComponents', () => {
        const actual = handleComponent(createDummyDataGrid(), {}, [], '', mockedTranslate);
        expect(actual.find((component) => component.type === 'datagrid')).toBeUndefined();
      });

      it("is ignored if subComponents don't have submissions", () => {
        const actual = handleComponent(
          createDummyDataGrid('Datagrid', [createDummyTextfield(), createDummyEmail(), createDummyRadioPanel()]),
          { data: { datagrid: [] } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual.find((component) => component.type === 'datagrid')).toBeUndefined();
      });

      it('renders datagrid as expected', () => {
        const actual = handleComponent(
          createDummyDataGrid('DataGrid', [createDummyTextfield()]),
          { data: { datagrid: [dummySubmission.data] } },
          [],
          '',
          mockedTranslate,
        );

        expect(actual).toEqual([
          {
            label: 'DataGrid',
            key: 'datagrid',
            type: 'datagrid',
            components: [
              {
                type: 'datagrid-row',
                label: 'datagrid-row-title',
                key: 'datagrid-row-0',
                components: [{ label: 'Tekstfelt', value: 'tekstfelt-verdi', key: 'tekstfelt', type: 'textfield' }],
              },
            ],
          },
        ]);
      });
    });

    describe('Number', () => {
      it('to be formated correctly', () => {
        const actual = handleComponent(
          createDummyNumberField(),
          { data: { number: 2512.388 } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual[0].value).toEqual('2 512,39'.replaceAll(' ', '\u00A0'));
      });

      it('should add prefix and suffix', () => {
        const actual = handleComponent(
          createDummyNumberField('MVA:', '%'),
          { data: { number: 25 } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual[0].value).toBe('MVA: 25 %');
      });
    });

    describe('Currency', () => {
      it('to be formated correctly', () => {
        const actual = handleComponent(
          createDummyCurrencyField(),
          { data: { penger: 2512.3889999999997 } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual[0].value).toEqual('2 512,39 kr'.replaceAll(' ', '\u00A0'));
      });
    });

    describe('amountWithCurrency', () => {
      it('to be formated correctly', () => {
        const actual = handleComponent(
          createDummyAmountWithCurrency(),
          { data: { amountwithcurrency: { valutavelger: { value: 'NOK' }, belop: 2512.3889999999997 } } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual[0].value).toEqual('2 512,39 NOK'.replaceAll(' ', '\u00A0'));
      });

      it("should not add anything if belop isn't filled", () => {
        const actual = handleComponent(
          createDummyAmountWithCurrency(),
          { data: { amountwithcurrency: { valutavelger: { value: 'NOK' } } } },
          [],
          '',
          mockedTranslate,
        );
        expect(actual).toEqual([]);
      });
    });
  });

  describe('BankAccount', () => {
    it('to be formated correctly', () => {
      const actual = handleComponent(
        createDummyBankAccountField(),
        { data: { bankaccount: '12345678911' } },
        [],
        '',
        mockedTranslate,
      );
      expect(actual[0].value).toBe('1234 56 78911');
    });
  });

  describe('OrgNr', () => {
    it('to be formated correctly', () => {
      const actual = handleComponent(
        createDummyOrgNrField(),
        { data: { orgnr: '111111111' } },
        [],
        '',
        mockedTranslate,
      );
      expect(actual[0].value).toBe('111 111 111');
    });
  });

  describe('When creating form summary object', () => {
    it('is created as it should', () => {
      const actual = createFormSummaryObject(
        createFormObject([
          createPanelObject('Panel that should not be included', [
            createDummyContentElement('Content that should be ignored'),
            createDummyHTMLElement('HTMLElement that should be ignored'),
            createDummyContainerElement('Container that should be ignored'),
            createDummyNavSkjemagruppe('NavSkjemagruppe that should be ignored'),
            createDummyDataGrid('Datagrid that should be ignored because it is empty'),
            createDummyDataGrid('Datagrid that contains components that should be ignored', [
              createDummyContentElement('Content that should be ignored'),
              createDummyNavSkjemagruppe('NavSkjemagruppe that should be ignored'),
              createDummyDataGrid('Datagrid that should be ignored'),
            ]),
          ]),
          createPanelObject('Panel with simple fields that should all be included', [
            createDummyTextfield('Simple Textfield'),
            createDummyEmail('Simple Email'),
          ]),
          createPanelObject('Panel with image component', [createDummyImage('Simple Image')]),
          createPanelObject('Panel with container', [
            createDummyContainerElement('Container', [
              createDummyTextfield('Textfield in container'),
              createDummyEmail('Email in container'),
            ]),
          ]),
          createPanelObject('Panel with containers nested in different layout components', [
            createDummyContainerElement('Container1', [
              createDummyNavSkjemagruppe('NavSkjemaGruppe', [
                createDummyTextfield('Field'),
                createDummyContainerElement('Container2', [
                  createPanelObject('Panel', [
                    createDummyTextfield('Field'),
                    createDummyContainerElement('Container3', [
                      createDummyTextfield('Field'),
                      createDummyContainerElement('Container4', [
                        createDummyTextfield('Field'),
                        createDummyDataGrid('Datagrid', [createDummyTextfield('Field')]),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
          createPanelObject('Panel with navSkjemagruppe', [
            createDummyNavSkjemagruppe('NavSkjemagruppe', [
              createDummyTextfield('Textfield in NavSkjemagruppe'),
              createDummyEmail('Email in NavSkjemagruppe'),
            ]),
          ]),
          createPanelObject('Panel with radioPanel', [createDummyRadioPanel('RadioPanel')]),
          createPanelObject('Panel with day component', [
            createDummyDayComponent('Year contains 00'),
            createDummyDayComponent('Year without 00'),
            createDummyDayComponent('Month is not required'),
          ]),
        ]),
        {
          data: {
            simpletextfield: 'simpletextfield-value',
            simpleemail: 'simpleemail-value',
            container: {
              textfieldincontainer: 'textfieldincontainer-value',
              emailincontainer: 'emailincontainer-value',
            },
            container1: {
              field: 'nested-field-1',
              container2: {
                field: 'nested-field-2',
                container3: {
                  field: 'nested-field-3',
                  container4: {
                    field: 'nested-field-4',
                    datagrid: [
                      {
                        field: 'field inside datagrid does not inherit container key',
                      },
                    ],
                  },
                },
              },
            },
            textfieldinnavskjemagruppe: 'textfieldinnavskjemagruppe-value',
            emailinnavskjemagruppe: 'emailinnavskjemagruppe-value',
            radiopanel: 'yes',
            yearcontains00: '09/00/2000',
            yearwithout00: '03/00/2021',
            monthisnotrequired: '00/00/2000',
          },
        },
        mockedTranslate,
      );
      expect(actual).toEqual([
        {
          label: 'Panel with simple fields that should all be included',
          key: 'panelwithsimplefieldsthatshouldallbeincluded',
          type: 'panel',
          components: [
            {
              label: 'Simple Textfield',
              key: 'simpletextfield',
              type: 'textfield',
              value: 'simpletextfield-value',
            },
            {
              label: 'Simple Email',
              key: 'simpleemail',
              type: 'email',
              value: 'simpleemail-value',
            },
          ],
        },
        {
          label: 'Panel with container',
          key: 'panelwithcontainer',
          type: 'panel',
          components: [
            {
              label: 'Textfield in container',
              key: 'container.textfieldincontainer',
              type: 'textfield',
              value: 'textfieldincontainer-value',
            },

            {
              label: 'Email in container',
              key: 'container.emailincontainer',
              type: 'email',
              value: 'emailincontainer-value',
            },
          ],
        },
        {
          label: 'Panel with containers nested in different layout components',
          key: 'panelwithcontainersnestedindifferentlayoutcomponents',
          type: 'panel',
          components: [
            {
              label: 'NavSkjemaGruppe-legend',
              key: 'navskjemagruppe',
              type: 'navSkjemagruppe',
              components: [
                {
                  label: 'Field',
                  key: 'container1.field',
                  type: 'textfield',
                  value: 'nested-field-1',
                },
                {
                  label: 'Panel',
                  key: 'panel',
                  type: 'panel',
                  components: [
                    {
                      label: 'Field',
                      key: 'container1.container2.field',
                      type: 'textfield',
                      value: 'nested-field-2',
                    },
                    {
                      label: 'Field',
                      key: 'container1.container2.container3.field',
                      type: 'textfield',
                      value: 'nested-field-3',
                    },
                    {
                      label: 'Field',
                      key: 'container1.container2.container3.container4.field',
                      type: 'textfield',
                      value: 'nested-field-4',
                    },
                    {
                      label: 'Datagrid',
                      key: 'container1.container2.container3.container4.datagrid',
                      type: 'datagrid',
                      components: [
                        {
                          label: 'datagrid-row-title',
                          key: 'datagrid-row-0',
                          type: 'datagrid-row',
                          components: [
                            {
                              label: 'Field',
                              key: 'field',
                              type: 'textfield',
                              value: 'field inside datagrid does not inherit container key',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Panel with navSkjemagruppe',
          key: 'panelwithnavskjemagruppe',
          type: 'panel',
          components: [
            {
              label: 'NavSkjemagruppe-legend',
              key: 'navskjemagruppe',
              type: 'navSkjemagruppe',
              components: [
                {
                  label: 'Textfield in NavSkjemagruppe',
                  key: 'textfieldinnavskjemagruppe',
                  type: 'textfield',
                  value: 'textfieldinnavskjemagruppe-value',
                },
                {
                  label: 'Email in NavSkjemagruppe',
                  key: 'emailinnavskjemagruppe',
                  type: 'email',
                  value: 'emailinnavskjemagruppe-value',
                },
              ],
            },
          ],
        },
        {
          label: 'Panel with radioPanel',
          key: 'panelwithradiopanel',
          type: 'panel',
          components: [
            {
              label: 'RadioPanel',
              key: 'radiopanel',
              type: 'radiopanel',
              value: 'YES-label',
            },
          ],
        },
        {
          label: 'Panel with day component',
          key: 'panelwithdaycomponent',
          type: 'panel',
          components: [
            {
              label: 'Year contains 00',
              key: 'yearcontains00',
              type: 'day',
              value: 'September, 2000',
            },
            {
              label: 'Year without 00',
              key: 'yearwithout00',
              type: 'day',
              value: 'Mars, 2021',
            },
            {
              label: 'Month is not required',
              key: 'monthisnotrequired',
              type: 'day',
              value: '2000',
            },
          ],
        },
      ]);
    });

    describe('panels', () => {
      it('are added as arrays on the top level', () => {
        const actual = createFormSummaryObject(
          createFormObject([
            createPanelObject('Panel 1', [createDummyTextfield()]),
            createPanelObject('Panel 2', [createDummyEmail()]),
          ]),
          dummySubmission,
          mockedTranslate,
        );
        expect(actual).toBeInstanceOf(Array);
        expect(actual.length).toBe(2);
      });
    });

    describe('En datagrid med et tekstfelt og en navDatepicker', () => {
      const summaryWithDatagridComponents = (datagridComponents) => ({
        label: 'Page 1',
        key: 'page1',
        type: 'panel',
        components: [
          {
            label: 'Data Grid',
            key: 'datagrid',
            type: 'datagrid',
            components: [
              {
                type: 'datagrid-row',
                label: 'datagrid-row-title',
                key: 'datagrid-row-0',
                components: datagridComponents,
              },
            ],
          },
        ],
      });

      it('Oppsummeringen inneholder både fornavn og startdato', () => {
        const form = createFormObject([
          createPanelObject('Page 1', [
            createDummyDataGrid('Data Grid', [createDummyTextfield('Fornavn'), createDummyNavDatepicker('Startdato')]),
          ]),
        ]);
        const actual = createFormSummaryObject(form, {
          data: {
            datagrid: [{ fornavn: 'Trine', startdato: '2021-10-03' }],
          },
        });
        expect(actual).toEqual([
          summaryWithDatagridComponents([
            {
              label: 'Fornavn',
              key: 'fornavn',
              type: 'textfield',
              value: 'Trine',
            },
            {
              label: 'Startdato-label',
              key: 'startdato',
              type: 'navDatepicker',
              value: '03.10.2021',
            },
          ]),
        ]);
      });

      it('Oppsummeringen inneholder kun startdato siden fornavn ikke er oppgitt', () => {
        const form = createFormObject([
          createPanelObject('Page 1', [
            createDummyDataGrid('Data Grid', [createDummyTextfield('Fornavn'), createDummyNavDatepicker('Startdato')]),
          ]),
        ]);
        const actual = createFormSummaryObject(form, {
          data: {
            datagrid: [{ startdato: '2021-10-03' }],
          },
        });
        expect(actual).toEqual([
          summaryWithDatagridComponents([
            {
              label: 'Startdato-label',
              key: 'startdato',
              type: 'navDatepicker',
              value: '03.10.2021',
            },
          ]),
        ]);
      });
    });

    describe('Alertstripe with custom conditional using lodash', () => {
      it('should not be visible when vegghengt is not present in submission data', () => {
        const actual = createFormSummaryObject(
          testformCustomConditional.form,
          testformCustomConditional.submissionVegghengtOmitted,
          mockedTranslate,
        );
        const alertstripes = flattenComponents(actual).filter(onlyAlertstripes);
        expect(alertstripes).toHaveLength(0);
      });

      it('should not be visible when vegghengt=nei', () => {
        const actual = createFormSummaryObject(
          testformCustomConditional.form,
          testformCustomConditional.submissionVegghengtNei,
          mockedTranslate,
        );
        const alertstripes = flattenComponents(actual).filter(onlyAlertstripes);
        expect(alertstripes).toHaveLength(0);
      });

      it('should be visible when vegghengt=ja', () => {
        const actual = createFormSummaryObject(
          testformCustomConditional.form,
          testformCustomConditional.submissionVegghengtJa,
          mockedTranslate,
        );
        const alertstripes = flattenComponents(actual).filter(onlyAlertstripes);
        expect(alertstripes).toHaveLength(1);
        expect(alertstripes[0].value).toBe('Må signeres av både eier og bruker');
      });
    });

    describe('custom conditional using utils', () => {
      let form;

      beforeEach(() => {
        form = {
          ...createPanelObject('Panel 1', [
            createDummyNavDatepicker('Birth date'),
            {
              ...createDummyTextfield('First name'),
              customConditional: "show = utils.isBornBeforeYear(2000, 'birthdate', submission)",
            },
          ]),
        };
      });

      it('should be visible when condition is evaluated to true', () => {
        const submission = { data: { birthdate: '1999-08-21', firstname: 'Mille' } };
        const actual = createFormSummaryObject(form, submission, mockedTranslate);
        expect(actual).toHaveLength(2);
        expect(actual[0].key).toEqual('birthdate');
        expect(actual[1].key).toEqual('firstname');
      });

      it('should not be visible when condition is evaluated to false', () => {
        const submission = { data: { birthdate: '2000-08-21', firstname: 'Mille' } };
        const actual = createFormSummaryObject(form, submission, mockedTranslate);
        expect(actual).toHaveLength(1);
        expect(actual[0].key).toEqual('birthdate');
      });
    });

    describe('custom conditional using lodash', () => {
      let form;

      beforeEach(() => {
        form = {
          ...createPanelObject('Panel 1', [
            createDummyTextfield('prompt'),
            { ...createDummyTextfield('First name'), customConditional: "show = _.get(data, 'prompt') === 'hello'" },
          ]),
        };
      });

      it('should be visible when condition is evaluated to true', () => {
        const submission = { data: { prompt: 'hello', firstname: 'Mille' } };
        const actual = createFormSummaryObject(form, submission, mockedTranslate);
        expect(actual).toHaveLength(2);
        expect(actual[0].key).toEqual('prompt');
        expect(actual[1].key).toEqual('firstname');
      });

      it('should not be visible when condition is evaluated to false', () => {
        const submission = { data: { prompt: 'goodbye', firstname: 'Mille' } };
        const actual = createFormSummaryObject(form, submission, mockedTranslate);
        expect(actual).toHaveLength(1);
        expect(actual[0].key).toEqual('prompt');
      });
    });

    describe('Alertstripe inside container with conditional', () => {
      it('should not be visible when show=false for container', () => {
        const actual = createFormSummaryObject(
          testformContainerConditional.form,
          testformContainerConditional.submissionKjokken,
          mockedTranslate,
        );
        const alertstripes = flattenComponents(actual).filter(onlyAlertstripes);
        expect(alertstripes).toHaveLength(0);
      });

      it('should be visible when show=true for containerBad', () => {
        const actual = createFormSummaryObject(
          testformContainerConditional.form,
          testformContainerConditional.submissionBad,
          mockedTranslate,
        );
        const alertstripes = flattenComponents(actual).filter(onlyAlertstripes);
        expect(alertstripes).toHaveLength(1);
        expect(alertstripes[0].value).toBe('Må signeres av både eier og bruker (bad)');
      });

      it('should be visible when show=true for containerStue', () => {
        const actual = createFormSummaryObject(
          testformContainerConditional.form,
          testformContainerConditional.submissionStue,
          mockedTranslate,
        );
        const alertstripes = flattenComponents(actual).filter(onlyAlertstripes);
        expect(alertstripes).toHaveLength(1);
        expect(alertstripes[0].value).toBe('Må signeres av både eier og bruker (stue)');
      });
    });

    it('dato og data grid / skjemagruppe', () => {
      const actual = createFormSummaryObject(
        datoISkjemagruppeIDatagrid.form,
        datoISkjemagruppeIDatagrid.submission,
        mockedTranslate,
      );
      expect(actual).toHaveLength(1);
      expect(actual[0].components).toHaveLength(3);

      const datoUtenfor = actual[0].components[0];
      expect(datoUtenfor.type).toBe('navDatepicker');
      expect(datoUtenfor.label).toBe('Dato utenfor');
      expect(datoUtenfor.value).toBe('01.10.2021');

      const dataGrid = actual[0].components[1];
      expect(dataGrid.type).toBe('datagrid');
      expect(dataGrid.label).toBe('Data Grid');
      expect(dataGrid.components).toHaveLength(1);

      const dataGridRow1 = dataGrid.components[0];
      expect(dataGridRow1.type).toBe('datagrid-row');
      expect(dataGridRow1.components).toHaveLength(2);

      const datoIDataGrid = dataGridRow1.components[0];
      expect(datoIDataGrid.type).toBe('navDatepicker');
      expect(datoIDataGrid.label).toBe('Dato i data grid');
      expect(datoIDataGrid.value).toBe('02.10.2021');

      const skjemagruppe = dataGridRow1.components[1];
      expect(skjemagruppe.type).toBe('navSkjemagruppe');
      expect(skjemagruppe.components).toHaveLength(1);

      const datoISkjemagruppeInneIDataGrid = skjemagruppe.components[0];
      expect(datoISkjemagruppeInneIDataGrid.type).toBe('navDatepicker');
      expect(datoISkjemagruppeInneIDataGrid.label).toBe('Dato i skjemagruppe i data grid');
      expect(datoISkjemagruppeInneIDataGrid.value).toBe('03.10.2021');

      const skjemagruppeUtenforDataGrid = actual[0].components[2];
      expect(skjemagruppeUtenforDataGrid.type).toBe('navSkjemagruppe');
      expect(skjemagruppeUtenforDataGrid.components).toHaveLength(1);

      const datoISkjemagruppeUtenforDataGrid = skjemagruppeUtenforDataGrid.components[0];
      expect(datoISkjemagruppeUtenforDataGrid.type).toBe('navDatepicker');
      expect(datoISkjemagruppeUtenforDataGrid.label).toBe('Dato i skjemagruppe utenfor Data Grid');
      expect(datoISkjemagruppeUtenforDataGrid.value).toBe('04.10.2021');
    });
  });
});
