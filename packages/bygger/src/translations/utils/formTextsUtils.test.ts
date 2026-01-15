import { FormsApiTranslation, MockedComponentObjectForTest, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { getHeadersForExport, getRowsForExportFromForm } from './exportUtils';
import { getTextKeysFromForm } from './formTextsUtils';

const {
  createDummyAttachment,
  createDummyAttachmentValues,
  createDummyCheckbox,
  createDummyContainerElement,
  createDummyContentElement,
  createDummyDataGrid,
  createDummyEmail,
  createDummyFlervalg,
  createDummyHTMLElement,
  createDummyNavSkjemagruppe,
  createDummyRadioPanel,
  createDummyTextfield,
  createDummyAlertstripe,
  createDummySelectComponent,
  createDummyButtonComponent,
  createFormPropertiesObject,
  createPanelObject,
  createFormsApiFormObject,
} = MockedComponentObjectForTest;

const form = createFormsApiFormObject(
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

describe('utils', () => {
  describe('testGetAllTextsAndTypeForForm', () => {
    it('Test empty form', () => {
      const actual = getTextKeysFromForm(createFormsApiFormObject([], 'title'));
      expect(actual).toEqual(['title']);
    });

    it('Test form with panel and text fields', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [
            createPanelObject(
              'Introduksjon',
              [
                createDummyTextfield(),
                createDummyEmail(),
                createDummyTextfield(
                  'wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV',
                ),
              ],
              'Introduksjon',
            ),
          ],
          'title',
        ),
      );
      expect(actual).toEqual([
        'title',
        'Introduksjon',
        'Tekstfelt',
        'Email',
        'wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV',
      ]);
    });

    it('Test form with panel, html elements and contents', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
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
      );
      expect(actual).toEqual([
        'title',
        'Introduksjon',
        'Test html element',
        'VB2fDXfOP4frsF1EAggorIU2H4jdosE4J3jYQYn0vZGtqK5yqVWAFLPelnffebNBKxMaUbQ4IKFp6QsD9',
        'Test content',
        'VrcUdaapouM1tt1nPQmW4qlUs7P0bbkAoiFLHyRmP0qlkDCptvszDEntC5iGZB2hkkBgYkU8I8CQzwgn1',
      ]);
    });

    it('Test form with panel, skjemagruppe and radio panel', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
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
      );
      expect(actual).toEqual([
        'title',
        'Introduksjon',
        'NavSkjemagruppe-legend',
        'RadioPanel',
        'NO-label',
        'YES-label',
        'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF',
      ]);
    });

    it('Test form with panel, skjemagruppe, datagrid and radio panel', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
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
      );
      expect(actual).toEqual([
        'title',
        'Introduksjon',
        'NavSkjemagruppe-legend',
        'RadioPanel',
        'NO-label',
        'YES-label',
        'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF',
        'DataGrid',
        'Radio panel inside data grid',
        'Radio panel inside data grid without label',
      ]);
    });

    it('Test form with panel, container and checkbox', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
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
      );
      expect(actual).toEqual([
        'title',
        'Introduksjon',
        'Container',
        'NavCheckbox',
        'zJ6lzq1ED1N7yDoi0J892Vbk3Wt1qwTQOlr7R639KAq1Xlzlf3tXozLD5a3abswyyl7qE9wcUlJWddlUV',
        'NavCheckbox in a container without label',
        'RyiX3OuRGRdTT1AIoP6qK2MLGPkXdij36yFs0NiTY1WfptfYkuY0cBZOIk4mLLMJWgEEt0SpaQUojObrM',
      ]);
    });

    it('Test form with duplicated text field', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [
            createPanelObject(
              'Introduksjon',
              [createDummyTextfield('Same textfield'), createDummyEmail(), createDummyTextfield('Same textfield')],
              'Introduksjon',
            ),
          ],
          'title',
        ),
      );
      expect(actual).toEqual(['title', 'Introduksjon', 'Same textfield', 'Email']);
    });

    it('Test form with alertstripes and HTML element', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
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
                  '<h3>Eventuell utbetaling av AAP</h3> Du kan bare ha ett kontonummer registrert hos Nav. Du kan enkelt <a href="https://www.nav.no/soknader/nb/person/diverse/endre-opplysninger-om-bankkontonummer#papirsoknader" target="_blank"> endre hvilket kontonummer vi benytter (åpnes i ny fane)</a>. <br/>',
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
      );
      expect(actual).toEqual([
        'title',
        'Introduksjon',
        'Test Alertstripe',
        'Mer informasjon finner dere på Brønnøysundregistrenes nettside <a href= "https://www.brreg.no/bedrift/underenhet/" target="_blank">Underenhet (åpnes i ny fane)</a>.',
        'Alertstrip with content',
        'show content in Pdf',
        '<h3>Eventuell utbetaling av AAP</h3> Du kan bare ha ett kontonummer registrert hos Nav. Du kan enkelt <a href="https://www.nav.no/soknader/nb/person/diverse/endre-opplysninger-om-bankkontonummer#papirsoknader" target="_blank"> endre hvilket kontonummer vi benytter (åpnes i ny fane)</a>. <br/>',
        '<h3>Eventuell utbetaling av AAP</h3>',
        'Eventuell utbetaling av AAP',
      ]);
    });

    it('Test form with select component', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [createPanelObject('Introduksjon', [createDummySelectComponent()], 'Introduksjon')],
          'title',
        ),
      );
      expect(actual).toEqual(['title', 'Introduksjon', 'Select', 'Milk', 'Bread', 'Juice']);
    });

    it('Test form with Attachment', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [
            createPanelObject(
              'Vedleggspanel',
              [
                createDummyAttachment(
                  'Mitt vedlegg',
                  { vedleggstittel: 'Vedleggstittel', vedleggskode: 'ABC' },
                  createDummyAttachmentValues([
                    { key: 'leggerVedNaa' },
                    { key: 'ettersender', label: 'Ettersending label', description: 'Ettersending description' },
                    { key: 'harIkke', label: 'Har ikke label' },
                  ]),
                ),
              ],
              'Vedleggspanel',
            ),
          ],
          'title',
        ),
      );
      expect(actual).toEqual([
        'title',
        'Vedleggspanel',
        'Mitt vedlegg',
        TEXTS.statiske.attachment.leggerVedNaa,
        TEXTS.statiske.attachment.ettersender,
        'Ettersending label',
        'Ettersending description',
        TEXTS.statiske.attachment.harIkke,
        'Har ikke label',
      ]);
    });

    it('Test components with value descriptions (Flervalg and Radio)', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject([
          createPanelObject('Panel med komponenter som har flere beskrivelser', [
            createDummyRadioPanel('Radio med beskrivelser av verdiene', [
              { label: 'Ja', value: 'ja', description: 'Beskrivelse av ja' },
              { label: 'Kanskje', value: 'kanskje', description: 'Beskrivelse av kanskje' },
              { label: 'Uten beskrivelse', value: 'utenbeskrivelse' },
            ]),
            createDummyFlervalg('Flervalg med beskrivelser av verdiene', [
              { label: 'Lett valg', value: 'lettvalg', description: 'Beskrivelse av lett valg' },
              { label: 'Vanskelig valg', value: 'vanskelig valg', description: 'Beskrivelse av vanskelig valg' },
            ]),
          ]),
        ]),
      );
      expect(actual).toEqual([
        'Test form',
        'Panel med komponenter som har flere beskrivelser',
        'Radio med beskrivelser av verdiene',
        'Ja',
        'Beskrivelse av ja',
        'Kanskje',
        'Beskrivelse av kanskje',
        'Uten beskrivelse',
        'Flervalg med beskrivelser av verdiene',
        'Lett valg',
        'Beskrivelse av lett valg',
        'Vanskelig valg',
        'Beskrivelse av vanskelig valg',
      ]);
    });

    it('Test form with button component', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [createPanelObject('Introduksjon', [createDummyButtonComponent('buttonText')], 'Introduksjon')],
          'title',
        ),
      );

      expect(actual).toEqual(['title', 'Introduksjon', 'Knapp', 'buttonText']);
    });

    it('Henter innsendingsrelaterte tekster fra form properties', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [],
          'Testskjema',
          createFormPropertiesObject({
            skjemanummer: 'TST 12.13-14',
            submissionTypes: [],
            innsendingOverskrift: 'Gi det til pasienten',
            innsendingForklaring: 'Skriv ut skjemaet',
          }),
        ),
      );
      expect(actual).toEqual(['Testskjema', 'Gi det til pasienten', 'Skriv ut skjemaet']);
    });

    it('Henter downloadPdfButtonText form properties', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [],
          'Testskjema',
          createFormPropertiesObject({
            skjemanummer: 'TST 12.13-14',
            submissionTypes: ['PAPER'],
            downloadPdfButtonText: 'Last ned pdf',
          }),
        ),
      );
      expect(actual).toEqual(['Testskjema', 'Last ned pdf']);
    });

    it('Henter signatur-relaterte tekster fra form properties', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [],
          'Testskjema',
          createFormPropertiesObject({
            skjemanummer: 'TST 12.13-14',
            submissionTypes: ['PAPER'],
            descriptionOfSignatures: 'En lengre beskrivelse av hva man signerer på',
            signatures: {
              signature1: 'Arbeidstaker',
              signature2: 'Lege',
              signature2Description: 'Jeg bekrefter at arbeidstaker er syk',
            },
          }),
        ),
      );
      expect(actual).toEqual([
        'Testskjema',
        'En lengre beskrivelse av hva man signerer på',
        'Arbeidstaker',
        'Lege',
        'Jeg bekrefter at arbeidstaker er syk',
      ]);
    });
  });

  describe('test get all texts', () => {
    it('Test form with panel, skjemagruppe, datagrid, radio panel and select component', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
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
        'title',
        'Introduksjon',
        'NavSkjemagruppe-legend',
        'RadioPanel',
        'NO-label',
        'YES-label',
        'FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF',
        'DataGrid',
        'Radio panel inside data grid',
        'Select',
        'Milk',
        'Bread',
        'Juice',
        'Radio panel inside data grid without label',
      ]);
    });

    it('ignores country names when getting texts from form', () => {
      const actual = getTextKeysFromForm(
        createFormsApiFormObject(
          [
            createPanelObject('Skjema med hjemmelaget landvelger', [
              createDummySelectComponent('Hjemmelaget landvelger', [
                { label: 'Norge', value: 'no' },
                { label: 'Belgia', value: 'be' },
                { label: 'Brasil', value: 'br' },
              ]),
            ]),
          ],
          'title',
        ),
      );
      expect(actual).toEqual(['title', 'Skjema med hjemmelaget landvelger', 'Hjemmelaget landvelger']);
    });
  });

  describe('testGetTextsAndTranslationsForForm', () => {
    const translations: FormsApiTranslation[] = [
      {
        key: 'Ja',
        globalTranslationId: 1,
        nb: 'Ja',
        en: 'Yes',
      },
      {
        key: 'Jeg',
        nb: 'Jeg',
        nn: 'Eg',
      },
      {
        key: '<p>Test linjeskift linux\nwindows\r\napple\r</p>',
        nb: '<p>Test linjeskift linux\nwindows\r\napple\r</p>',
        en: '<p>Test Line break linux\nwindows\r\napple\r</p>',
      },
    ];

    it('Test form with translations', () => {
      const actual = getRowsForExportFromForm(form, translations);
      expect(actual).toEqual([
        { order: '001', type: 'tekst', text: 'test' },
        { order: '002', type: 'tekst', text: 'Introduksjon' },
        { order: '003', type: 'tekst', text: 'Ja', en: 'Yes (Global Tekst)' },
        { order: '004', type: 'tekst', text: 'Jeg', nn: 'Eg' },
        {
          order: '005-001',
          type: 'html',
          text: 'Test linjeskift linux windows apple ',
          en: 'Test Line break linux windows apple ',
        },
      ]);
    });
  });

  describe('Skjema med globale oversettelser som inneholder linjeskift', () => {
    it('fjerner linjeskift i tekster som skal eksporteres', () => {
      const testform = createFormsApiFormObject([
        {
          title: 'Veiledning',
          label: 'Panel',
          type: 'panel',
          key: 'panel',
          components: [
            {
              label: 'Alertstripe',
              type: 'alertstripe',
              key: 'alertstripe',
              content:
                '<p>Nav sender svar.\n<br>\nSe <a href="https://www.nav.no/person/" target="_blank">link</a>.</p>',
            },
          ],
        },
      ]);
      const testtranslations: FormsApiTranslation[] = [
        {
          key: 'Veiledning',
          globalTranslationId: 13,
          nb: 'Veiledning',
          nn: 'Rettleiing',
          en: 'Guidance',
        },
        {
          key: '<p>Nav sender svar.\n<br>\nSe <a href="https://www.nav.no/person/" target="_blank">link</a>.</p>',
          nb: '<p>Nav sender svar.\n<br>\nSe <a href="https://www.nav.no/person/" target="_blank">link</a>.</p>',
          nn: '<p>Nav sender svar.\n<br>\nSjå <a href="https://www.nav.no/person/" target="_blank">lenke</a>.</p>',
          en: '<p>Nav sends answers.\n<br>\nSee <a href="https://www.nav.no/person/" target="_blank">link</a>.</p>',
        },
      ];
      const eksport = getRowsForExportFromForm(testform, testtranslations);
      expect(eksport).toHaveLength(3);

      expect(eksport[0].text).toBe('Test form');

      expect(eksport[1].text).toBe('Veiledning');
      expect(eksport[1].en).toBe('Guidance (Global Tekst)');
      expect(eksport[1].nn).toBe('Rettleiing (Global Tekst)');

      expect(eksport[2].text).toEqual('Nav sender svar. <br> Se [link](https://www.nav.no/person/).');
      expect(eksport[2].en).toEqual('Nav sends answers. <br> See [link](https://www.nav.no/person/).');
      expect(eksport[2].nn).toEqual('Nav sender svar. <br> Sjå [lenke](https://www.nav.no/person/).');
    });
  });

  describe('testGetCSVfileHeaders', () => {
    it('Test headers with only origin form text', () => {
      const actual = getHeadersForExport([]);
      expect(actual).toEqual([
        { key: 'type', label: 'Type' },
        { key: 'order', label: 'Rekkefølge' },
        { key: 'text', label: 'Skjematekster' },
      ]);
    });

    it('Test headers with origin form text and language code', () => {
      const actual = getHeadersForExport([
        { key: 'text 1', nb: 'text 1', nn: 'text 1' },
        { key: 'text 2', nb: 'text 2', en: 'text 2' },
      ]);
      expect(actual).toEqual([
        { key: 'type', label: 'Type' },
        { key: 'order', label: 'Rekkefølge' },
        { key: 'text', label: 'Skjematekster' },
        { key: 'nn', label: 'Nynorsk' },
        { key: 'en', label: 'Engelsk' },
      ]);
    });
  });
});
