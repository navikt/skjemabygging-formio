import {
  Component,
  FormioTranslationMap,
  MockedComponentObjectForTest,
  NavFormType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getFormTexts, getTextsAndTranslationsForForm, getTextsAndTranslationsHeaders } from './utils';

const {
  createDummyCheckbox,
  createDummyContainerElement,
  createDummyContentElement,
  createDummyDataGrid,
  createDummyEmail,
  createDummyHTMLElement,
  createDummyNavSkjemagruppe,
  createDummyRadioPanel,
  createDummyTextfield,
  createDummyAlertstripe,
  createDummySelectComponent,
  createDummyButtonComponent,
  createFormObject,
  createPanelObject,
} = MockedComponentObjectForTest;

describe('testGetAllTextsAndTypeForForm', () => {
  it('Test empty form', () => {
    const actual = getFormTexts(createFormObject([], 'title'), true);
    expect(actual).toEqual([{ text: 'title', type: 'text' }]);
  });
  it('Test form with panel and text fields', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyTextfield(),
              createDummyEmail(),
              createDummyTextfield('wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV'),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Tekstfelt', type: 'text' },
      { text: 'Email', type: 'text' },
      { text: 'wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV', type: 'textarea' },
    ]);
  });
  it('Test form with panel, html elements and contents', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyHTMLElement('HTML', 'Test html element'),
              createDummyHTMLElement(
                'HTML',
                'VB2fDXfOP4frsF1EAggorIU2H4jdosE4J3jYQYn0vZGtqK5yqVWAFLPelnffebNBKxMaUbQ4IKFp6QsD9',
              ),
              createDummyContentElement('Content', 'Test content'),
              createDummyContentElement(
                'Content',
                'VrcUdaapouM1tt1nPQmW4qlUs7P0bbkAoiFLHyRmP0qlkDCptvszDEntC5iGZB2hkkBgYkU8I8CQzwgn1',
              ),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Test html element', type: 'text' },
      { text: 'VB2fDXfOP4frsF1EAggorIU2H4jdosE4J3jYQYn0vZGtqK5yqVWAFLPelnffebNBKxMaUbQ4IKFp6QsD9', type: 'textarea' },
      { text: 'Test content', type: 'text' },
      { text: 'VrcUdaapouM1tt1nPQmW4qlUs7P0bbkAoiFLHyRmP0qlkDCptvszDEntC5iGZB2hkkBgYkU8I8CQzwgn1', type: 'textarea' },
    ]);
  });
  it('Test form with panel, skjemagruppe and radio panel', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyNavSkjemagruppe('NavSkjemagruppe', [
                createDummyRadioPanel(),
                createDummyRadioPanel(
                  'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF',
                ),
              ]),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'NavSkjemagruppe-legend', type: 'text' },
      { text: 'RadioPanel', type: 'text' },
      { text: 'NO-label', type: 'text' },
      { text: 'YES-label', type: 'text' },
      { text: 'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF', type: 'textarea' },
    ]);
  });
  it('Test form with panel, skjemagruppe, datagrid and radio panel', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyNavSkjemagruppe('NavSkjemagruppe', [
                createDummyRadioPanel(),
                createDummyRadioPanel(
                  'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF',
                ),
                createDummyDataGrid('DataGrid', [createDummyRadioPanel('Radio panel inside data grid')]),
                createDummyDataGrid(
                  'DataGrid',
                  [createDummyRadioPanel('Radio panel inside data grid without label')],
                  true,
                ),
              ]),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'NavSkjemagruppe-legend', type: 'text' },
      { text: 'RadioPanel', type: 'text' },
      { text: 'NO-label', type: 'text' },
      { text: 'YES-label', type: 'text' },
      { text: 'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF', type: 'textarea' },
      { text: 'DataGrid', type: 'text' },
      { text: 'Radio panel inside data grid', type: 'text' },
      { text: 'Radio panel inside data grid without label', type: 'text' },
    ]);
  });
  it('Test form with panel, container and checkbox', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyContainerElement('Container', [
                createDummyCheckbox(),
                createDummyCheckbox(
                  'zJ6lzq1ED1N7yDoi0J892Vbk3Wt1qwTQOlr7R639KAq1Xlzlf3tXozLD5a3abswyyl7qE9wcUlJWddlUV',
                ),
              ]),
              createDummyContainerElement(
                'Container',
                [
                  createDummyCheckbox('NavCheckbox in a container without label'),
                  createDummyCheckbox(
                    'RyiX3OuRGRdTT1AIoP6qK2MLGPkXdij36yFs0NiTY1WfptfYkuY0cBZOIk4mLLMJWgEEt0SpaQUojObrM',
                  ),
                ],
                true,
              ),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Container', type: 'text' },
      { text: 'NavCheckbox', type: 'text' },
      { text: 'zJ6lzq1ED1N7yDoi0J892Vbk3Wt1qwTQOlr7R639KAq1Xlzlf3tXozLD5a3abswyyl7qE9wcUlJWddlUV', type: 'textarea' },
      { text: 'NavCheckbox in a container without label', type: 'text' },
      { text: 'RyiX3OuRGRdTT1AIoP6qK2MLGPkXdij36yFs0NiTY1WfptfYkuY0cBZOIk4mLLMJWgEEt0SpaQUojObrM', type: 'textarea' },
    ]);
  });
  it('Test form with panel and text field with suffix and prefix', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              { ...createDummyTextfield('TestFieldWithSuffix'), suffix: 'centimeter' },
              { ...createDummyTextfield('TestFieldWithprefix'), prefix: '+47' },
              createDummyTextfield('wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV'),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'TestFieldWithSuffix', type: 'text' },
      { text: 'centimeter', type: 'text' },
      { text: 'TestFieldWithprefix', type: 'text' },
      { text: '+47', type: 'text' },
      { text: 'wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV', type: 'textarea' },
    ]);
  });
  it('Test form with panel and text fields with special suffix', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              { ...createDummyTextfield(), suffix: 'cm' },
              { ...createDummyTextfield(), suffix: 'kg' },
              { ...createDummyTextfield(), suffix: '%' },
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Tekstfelt', type: 'text' },
    ]);
  });
  it('Test form with duplicated text field', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [createDummyTextfield('Same textfield'), createDummyEmail(), createDummyTextfield('Same textfield')],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Same textfield', type: 'text' },
      { text: 'Email', type: 'text' },
    ]);
  });
  it('Test form with alertstripes and HTML element', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyAlertstripe('Alertstripe with a short content', 'Test Alertstripe'),
              createDummyAlertstripe('Alertstripe without content'),
              createDummyAlertstripe(
                'Alertstripe with a long content',
                'Mer informasjon finner dere på Brønnøysundregistrenes nettside <a href= "https://www.brreg.no/bedrift/underenhet/" target="_blank">Underenhet (åpnes i ny fane)</a>.',
              ),
              createDummyAlertstripe('Alertstripe', 'Alertstrip with content', 'show content in Pdf'),
              createDummyHTMLElement(
                'HTML element',
                '<h3>Eventuell utbetaling av AAP</h3> Du kan bare ha ett kontonummer registrert hos NAV. Du kan enkelt <a href="https://www.nav.no/soknader/nb/person/diverse/endre-opplysninger-om-bankkontonummer#papirsoknader" target="_blank"> endre hvilket kontonummer vi benytter (åpnes i ny fane)</a>. <br/>',
              ),
              createDummyHTMLElement(
                'HTML element',
                '<h3>Eventuell utbetaling av AAP</h3>',
                'Eventuell utbetaling av AAP',
              ),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Test Alertstripe', type: 'text' },
      {
        text: 'Mer informasjon finner dere på Brønnøysundregistrenes nettside <a href= "https://www.brreg.no/bedrift/underenhet/" target="_blank">Underenhet (åpnes i ny fane)</a>.',
        type: 'textarea',
      },
      { text: 'Alertstrip with content', type: 'text' },
      { text: 'show content in Pdf', type: 'text' },
      {
        text: '<h3>Eventuell utbetaling av AAP</h3> Du kan bare ha ett kontonummer registrert hos NAV. Du kan enkelt <a href="https://www.nav.no/soknader/nb/person/diverse/endre-opplysninger-om-bankkontonummer#papirsoknader" target="_blank"> endre hvilket kontonummer vi benytter (åpnes i ny fane)</a>. <br/>',
        type: 'textarea',
      },
      { text: '<h3>Eventuell utbetaling av AAP</h3>', type: 'text' },
      { text: 'Eventuell utbetaling av AAP', type: 'text' },
    ]);
  });
  it('Test form with select component', () => {
    const actual = getFormTexts(
      createFormObject([createPanelObject('Introduksjon', [createDummySelectComponent()], 'Introduksjon')], 'title'),
      true,
    );
    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Select', type: 'text' },
      { text: 'Milk', type: 'text' },
      { text: 'Bread', type: 'text' },
      { text: 'Juice', type: 'text' },
    ]);
  });
  it('Test form with button component', () => {
    const actual = getFormTexts(
      createFormObject(
        [createPanelObject('Introduksjon', [createDummyButtonComponent('buttonText')], 'Introduksjon')],
        'title',
      ),
      true,
    );

    expect(actual).toEqual([
      { text: 'title', type: 'text' },
      { text: 'Introduksjon', type: 'text' },
      { text: 'Knapp', type: 'text' },
      { text: 'buttonText', type: 'text' },
    ]);
  });
  it('Henter innsendingsrelaterte tekster fra form properties', () => {
    const actual = getFormTexts(
      {
        components: [] as Component[],
        type: 'form',
        title: 'Testskjema',
        properties: {
          skjemanummer: 'TST 12.13-14',
          innsending: 'INGEN',
          innsendingOverskrift: 'Gi det til pasienten',
          innsendingForklaring: 'Skriv ut skjemaet',
        },
      } as NavFormType,
      true,
    );
    expect(actual).toEqual([
      { text: 'Testskjema', type: 'text' },
      { text: 'Gi det til pasienten', type: 'text' },
      { text: 'Skriv ut skjemaet', type: 'text' },
    ]);
  });
  it('Henter downloadPdfButtonText form properties', () => {
    const actual = getFormTexts(
      {
        components: [] as Component[],
        type: 'form',
        title: 'Testskjema',
        properties: {
          skjemanummer: 'TST 12.13-14',
          innsending: 'KUN_PAPIR',
          downloadPdfButtonText: 'Last ned pdf',
        },
      } as NavFormType,
      true,
    );
    expect(actual).toEqual([
      { text: 'Testskjema', type: 'text' },
      { text: 'Last ned pdf', type: 'text' },
    ]);
  });
  it('Henter signatur-relaterte tekster fra form properties', () => {
    const actual = getFormTexts(
      {
        components: [] as Component[],
        type: 'form',
        title: 'Testskjema',
        properties: {
          skjemanummer: 'TST 12.13-14',
          innsending: 'KUN_PAPIR',
          descriptionOfSignatures: 'En lengre beskrivelse av hva man signerer på',
          signatures: {
            signature1: 'Arbeidstaker',
            signature2: 'Lege',
            signature2Description: 'Jeg bekrefter at arbeidstaker er syk',
          },
        },
      } as NavFormType,
      true,
    );
    expect(actual).toEqual([
      { text: 'Testskjema', type: 'text' },
      { text: 'En lengre beskrivelse av hva man signerer på', type: 'text' },
      { text: 'Arbeidstaker', type: 'text' },
      { text: 'Lege', type: 'text' },
      { text: 'Jeg bekrefter at arbeidstaker er syk', type: 'text' },
    ]);
  });
});

describe('test get all texts', () => {
  it('Test form with panel, skjemagruppe, datagrid, radio panel and select component', () => {
    const actual = getFormTexts(
      createFormObject(
        [
          createPanelObject(
            'Introduksjon',
            [
              createDummyNavSkjemagruppe('NavSkjemagruppe', [
                createDummyRadioPanel(),
                createDummyRadioPanel(
                  'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF',
                ),
                createDummyDataGrid('DataGrid', [
                  createDummyRadioPanel('Radio panel inside data grid'),
                  createDummySelectComponent(),
                ]),
                createDummyDataGrid(
                  'DataGrid',
                  [createDummyRadioPanel('Radio panel inside data grid without label')],
                  true,
                ),
              ]),
            ],
            'Introduksjon',
          ),
        ],
        'title',
      ),
    );
    expect(actual).toEqual([
      { text: 'title' },
      { text: 'Introduksjon' },
      { text: 'NavSkjemagruppe-legend' },
      { text: 'RadioPanel' },
      { text: 'NO-label' },
      { text: 'YES-label' },
      { text: 'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF' },
      { text: 'DataGrid' },
      { text: 'Radio panel inside data grid' },
      { text: 'Select' },
      { text: 'Milk' },
      { text: 'Bread' },
      { text: 'Juice' },
      { text: 'Radio panel inside data grid without label' },
    ]);
  });
});
describe('testGetTextsAndTranslationsForForm', () => {
  const form = createFormObject(
    [
      createPanelObject(
        'Introduksjon',
        [
          createDummyTextfield('Ja'),
          createDummyTextfield('Jeg'),
          createDummyHTMLElement('HTML', '<p>Test linjeskift linux\nwindows\r\napple\r</p>'),
        ],
        'Introduksjon',
      ),
    ],
    'test',
  );
  const translations: FormioTranslationMap = {
    en: {
      id: '123',
      translations: {
        Ja: { value: 'Yes', scope: 'global' },
        '<p>Test linjeskift linux\nwindows\r\napple\r</p>': {
          value: '<p>Test Line break linux\nwindows\r\napple\r</p>',
          scope: 'local',
        },
      },
    },
    'nn-NO': { id: '2345', translations: { Jeg: { value: 'Eg', scope: 'local' } } },
  };

  it('Test form with translations', () => {
    const actual = getTextsAndTranslationsForForm(form, translations);
    expect(actual).toEqual([
      { text: 'test' },
      { text: 'Introduksjon' },
      { text: 'Ja', en: 'Yes (Global Tekst)' },
      { text: 'Jeg', 'nn-NO': 'Eg' },
      { text: '<p>Test linjeskift linux windows apple </p>', en: '<p>Test Line break linux windows apple </p>' },
    ]);
  });
});
describe('Skjema med globale oversettelser som inneholder linjeskift', () => {
  const form = {
    components: [
      {
        title: 'Veiledning',
        type: 'panel',
        components: [
          {
            label: 'Alertstripe',
            type: 'alertstripe',
            content: 'NAV sender svar.\n<br>\nSe <a href="https://www.nav.no/person/" target="_blank">link</a>.',
          },
        ],
      },
    ],
  } as NavFormType;
  const translations: FormioTranslationMap = {
    'nb-NO': {
      translations: {},
    },
    en: {
      translations: {
        Veiledning: { value: 'Guidance', scope: 'global' },
        'NAV sender svar.\n<br>\nSe <a href="https://www.nav.no/person/" target="_blank">link</a>.': {
          value: 'NAV sends answers.\n<br>\nSee <a href="https://www.nav.no/person/" target="_blank">link</a>.',
          scope: 'global',
        },
      },
    },
    'nn-NO': {
      translations: {
        Veiledning: { value: 'Rettleiing', scope: 'global' },
        'NAV sender svar.\n<br>\nSe <a href="https://www.nav.no/person/" target="_blank">link</a>.': {
          value: 'NAV sender svar.\n<br>\nSjå <a href="https://www.nav.no/person/" target="_blank">lenke</a>.',
          scope: 'global',
        },
      },
    },
  };
  it('fjerner linjeskift i tekster som skal eksporteres', () => {
    const eksport = getTextsAndTranslationsForForm(form, translations);
    expect(eksport).toHaveLength(2);

    expect(eksport[0].text).toBe('Veiledning');
    expect(eksport[0].en).toBe('Guidance (Global Tekst)');
    expect(eksport[0]['nn-NO']).toBe('Rettleiing (Global Tekst)');

    expect(eksport[1].text).toBe(
      'NAV sender svar. <br> Se <a href=""https://www.nav.no/person/"" target=""_blank"">link</a>.',
    );
    expect(eksport[1].en).toBe(
      'NAV sends answers. <br> See <a href=""https://www.nav.no/person/"" target=""_blank"">link</a>. (Global Tekst)',
    );
    expect(eksport[1]['nn-NO']).toBe(
      'NAV sender svar. <br> Sjå <a href=""https://www.nav.no/person/"" target=""_blank"">lenke</a>. (Global Tekst)',
    );
  });
});
describe('testGetCSVfileHeaders', () => {
  it('Test headers with only origin form text', () => {
    const actual = getTextsAndTranslationsHeaders([] as FormioTranslationMap);
    expect(actual).toEqual([{ key: 'text', label: 'Skjematekster' }]);
  });

  it('Test headers with origin form text and language code', () => {
    const actual = getTextsAndTranslationsHeaders({ en: {}, 'nn-NO': {} } as FormioTranslationMap);
    expect(actual).toEqual([
      { key: 'text', label: 'Skjematekster' },
      { key: 'en', label: 'EN' },
      { key: 'nn-NO', label: 'NN-NO' },
    ]);
  });
});
