import {
  DeclarationType,
  FamiliePdf,
  NavFormType,
  Submission,
  SummaryComponent,
  SummaryDataGrid,
  SummaryDataGridRow,
  SummaryFieldset,
  SummaryFieldsetType,
  SummaryPanel,
  SummarySubmissionValue,
} from '@navikt/skjemadigitalisering-shared-domain';
import { readFileSync } from 'fs';
import path from 'path';
import { conditionalsForm, conditionalsSubmission } from '../testdata/conditionals';
import { createFeltMapFromSubmission, createVerdilister } from './feltMapBuilder';

const createContainer = (
  label: string,
  type: SummaryFieldsetType | 'panel' | 'datagrid' | 'datagrid-row',
  components: SummaryComponent[] = [],
) =>
  ({
    label,
    components,
    key: label,
    type,
  }) as SummaryFieldset | SummaryPanel | SummaryDataGrid | SummaryDataGridRow;

const createPanel = (label: string, components: SummaryComponent[] = []) =>
  createContainer(label, 'panel', components) as SummaryPanel;

const createComponent = (
  label: string,
  value: SummarySubmissionValue | string[],
  type = 'textfield',
  optionalProps = {},
) =>
  ({
    label,
    value,
    type,
    key: label,
    ...optionalProps,
  }) as SummaryComponent;

const mockTranslate = (text: string) => text;
const panels = [createPanel('Panel 1'), createPanel('Panel 2'), createPanel('Panel 3')];
const bunntekst: FamiliePdf.EkstraBunntekst = {
  upperleft: 'Id: 12345678901',
  upperMiddle: '12. Mai 2025, kl. 12:00:00',
  upperRight: null,
  lowerleft: 'skjemanr',
  lowerMiddle: 'git version',
};

const filePathDrivingList = path.join(process.cwd(), '/src/services/documents/testdata/drivinglist.json');

describe('feltMapBuilder', () => {
  describe('createfeltMapFromSubmission', () => {
    const formWithTitle = {
      title: 'Abc def',
      components: [],
      properties: { signatures: [] },
    } as unknown as NavFormType;
    let feltMap: string;

    beforeEach(() => {
      feltMap = createFeltMapFromSubmission(formWithTitle, { data: {} } as Submission, 'digital', mockTranslate);
    });

    it('creates feltMap document with the forms title', () => {
      expect(feltMap).toContain('"label":"Abc def"');
    });

    it('sets norsk Bokmål as language by default', () => {
      expect(feltMap).toContain('"språk":"nb"');
    });

    // See conditionals.ts for explanation
    it('should show data in html with a form that has components with same key ("annet") and one of them is conditionally hidden', () => {
      feltMap = createFeltMapFromSubmission(
        conditionalsForm as unknown as NavFormType,
        conditionalsSubmission as unknown as Submission,
        'digital',
        mockTranslate,
      );
      expect(feltMap).toContain('tekst som skal vises');
    });

    it('sets the language from parameter', () => {
      feltMap = createFeltMapFromSubmission(formWithTitle, { data: {} } as Submission, 'digital', mockTranslate, 'nn');
      expect(feltMap).toContain('"språk":"nn"');
    });
  });

  describe('Fields from form and submission', () => {
    it('adds headers for each top level element in the array', () => {
      const verdiliste = createVerdilister(panels);
      const feltMap: FamiliePdf.FeltMap = {
        label: 'title',
        pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
        skjemanummer: 'NAV 11-12.15B',
        verdiliste: verdiliste,
        bunntekst,
      };

      const feltMapString = JSON.stringify(feltMap);
      expect(feltMapString).toContain('Panel 1');
      expect(feltMapString).toContain('Panel 2');
      expect(feltMapString).toContain('Panel 3');
    });

    it('adds fields for each element with a field type in the array', () => {
      const verdiliste = createVerdilister([
        createPanel('Panel', [createComponent('Field 1', 'value 1'), createComponent('Field 2', 'value 2')]),
      ]);
      const feltMap: FamiliePdf.FeltMap = {
        label: 'title',
        pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
        skjemanummer: 'NAV 11-12.15B',
        verdiliste: verdiliste,
        bunntekst,
      };

      const feltMapString = JSON.stringify(feltMap);
      expect(feltMapString).toContain('Field 1');
      expect(feltMapString).toContain('value 1');
      expect(feltMapString).toContain('Field 2');
      expect(feltMapString).toContain('value 2');
    });
  });

  describe('Container component types', () => {
    describe('fieldset', () => {
      it('adds the fields contained by the fieldset', () => {
        const verdiliste = createVerdilister([
          createPanel('Panel', [createContainer('Fieldset', 'fieldset', [createComponent('Field', 'value')])]),
        ]);
        const feltMap: FamiliePdf.FeltMap = {
          label: 'title',
          pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
          skjemanummer: 'NAV 11-12.15B',
          verdiliste: verdiliste,
          bunntekst,
        };

        const feltMapString = JSON.stringify(feltMap);
        expect(feltMapString).toContain('Panel');
        //expect(feltMapString).not.toContain('Fieldset'); TODO
        expect(feltMapString).toContain('Field');
        expect(feltMapString).toContain('value');
      });

      it('adds fields with value with tab', () => {
        const verdiliste = createVerdilister([
          createPanel('Panel', [
            createContainer('Fieldset', 'fieldset', [
              createComponent(
                'Field',
                'bruke etableringsperioden til å utvikle og konkretisere forretningsideen.\n\nPlanen for etableringsperioden er:\n1.\tStarte et FoU-prosjekt i samarbeid med et godkjent forsknings- og utviklingsmiljø.',
              ),
              createComponent('Field', 'etter etableringsperioden forfine produket.\n\tI samarbeid med FoU-miljø.'),
            ]),
          ]),
        ]);
        const feltMap: FamiliePdf.FeltMap = {
          label: 'title',
          pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
          skjemanummer: 'NAV 11-12.15B',
          verdiliste: verdiliste,
          bunntekst,
        };

        const feltMapString = JSON.stringify(feltMap).replaceAll('\\t', '  ');
        expect(feltMapString).toContain('Panel');
        expect(feltMapString).toContain('Field');
        expect(feltMapString).toContain('  Starte et FoU-prosjekt');
        expect(feltMapString).toContain('  I samarbeid med');
      });
    });

    /* *** */
    describe('datagrid', () => {
      let feltMapString: string;

      beforeEach(() => {
        const verdiliste = createVerdilister([
          createPanel('Panel', [createContainer('My datagrid', 'datagrid', [createComponent('Field', 'value')])]),
        ]);
        const feltMap: FamiliePdf.FeltMap = {
          label: 'title',
          pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
          skjemanummer: 'NAV 11-12.15B',
          verdiliste: verdiliste,
          bunntekst,
        };
        feltMapString = JSON.stringify(feltMap);
      });

      it('adds an h3 with the datagrid label', () => {
        expect(feltMapString).toContain('My datagrid');
      });

      describe('Containing datagrid rows', () => {
        beforeEach(() => {
          const verdiliste = createVerdilister([
            createPanel('Panel', [
              createContainer('My datagrid', 'datagrid', [
                createContainer('My datagrid row 1', 'datagrid-row', [createComponent('Field 1', 'value 1')]),
                createContainer('My datagrid row 2', 'datagrid-row', [createComponent('Field 2', 'value 2')]),
              ]),
            ]),
          ]);
          const feltMap: FamiliePdf.FeltMap = {
            label: 'title',
            pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
            skjemanummer: 'NAV 11-12.15B',
            verdiliste: verdiliste,
            bunntekst,
          };
          feltMapString = JSON.stringify(feltMap);
        });

        it('displays the datagrid row labels', () => {
          expect(feltMapString).toContain('My datagrid row 1');
          expect(feltMapString).toContain('My datagrid row 2');
        });

        it('displays the contained fields', () => {
          expect(feltMapString).toContain('Field 1');
          expect(feltMapString).toContain('value 1');
          expect(feltMapString).toContain('Field 2');
          expect(feltMapString).toContain('value 2');
        });
      });

      describe('Containing a datagrid row with a skjemagruppe', () => {
        beforeEach(() => {
          const verdiliste = createVerdilister([
            createPanel('Panel', [
              createContainer('My datagrid', 'datagrid', [
                createContainer('My datagrid row', 'datagrid-row', [
                  createContainer('Skjemagruppe inside datagrid', 'navSkjemagruppe', [
                    createComponent('Field', 'value'),
                  ]),
                ]),
              ]),
            ]),
          ]);
          const feltMap: FamiliePdf.FeltMap = {
            label: 'title',
            pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
            skjemanummer: 'NAV 11-12.15B',
            verdiliste: verdiliste,
            bunntekst,
          };
          feltMapString = JSON.stringify(feltMap);
        });

        it('adds an h4 with the skjemagruppe label, in addition to an h3 and the row label', () => {
          expect(feltMapString).toContain('My datagrid');
          expect(feltMapString).toContain('My datagrid row');
          expect(feltMapString).toContain('Skjemagruppe inside datagrid');
        });

        it('adds the fields in the skjemagruppe', () => {
          expect(feltMapString).toContain('Field');
          expect(feltMapString).toContain('value');
        });
      });
    });
  });

  describe('For drivingList', () => {
    let feltMapString: string;

    beforeEach(() => {
      const symmaryList = readFileSync(filePathDrivingList, 'utf-8');
      const verdiliste = createVerdilister(JSON.parse(symmaryList) as SummaryPanel[]);
      const feltMap: FamiliePdf.FeltMap = {
        label: 'title',
        pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
        skjemanummer: 'NAV 11-12.15B',
        verdiliste: verdiliste,
        bunntekst,
      };
      feltMapString = JSON.stringify(feltMap);
    });

    it('feltMap contains expected data', () => {
      expect(feltMapString).toContain('tirsdag 03. juni 2025, parkeringsutgift: 100 kr');
      expect(feltMapString).toContain('onsdag 04. juni 2025, parkeringsutgift: 100 kr');
    });

    it('skips formatting for identity number', () => {
      const verdiliste = createVerdilister([createPanel('Panel', [createComponent('fnrfield', '12345678901')])]);
      const feltMap: FamiliePdf.FeltMap = {
        label: 'title',
        pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
        skjemanummer: 'NAV 11-12.15B',
        verdiliste: verdiliste,
        bunntekst,
      };

      const feltMapString = JSON.stringify(feltMap);
      expect(feltMapString).toContain('fnrfield');
      expect(feltMapString).toContain('12345678901');
    });
  });

  describe('Declaration', () => {
    const mockTranslate = (text: string) =>
      text === 'introPage.selfDeclaration.inputLabel' ? 'Jeg bekrefter at jeg vil svare så riktig som jeg kan' : text;

    it('self declaration text from dynamic intro page is displayed when introPage is enabled', () => {
      const formWithIntroPage = {
        title: 'Abc def',
        components: [],
        properties: { signatures: [] },
        introPage: {
          enabled: true,
          selfDeclaration: 'introPage.selfDeclaration.description.alt1',
        },
      } as unknown as NavFormType;

      const feltMap = createFeltMapFromSubmission(
        formWithIntroPage,
        { data: {} } as Submission,
        'digital',
        mockTranslate,
      );
      expect(feltMap).toContain('"label":"Erklæring"');
      expect(feltMap).toContain('Jeg bekrefter at jeg vil svare så riktig som jeg kan');
      expect(feltMap).not.toContain('Jeg bekrefter at opplysningene er riktige.');
    });

    it('self declaration text from static page is displayed when introPage is disabled', () => {
      const formWithoutIntroPage = {
        title: 'Abc def',
        components: [],
        properties: { signatures: [], declarationType: DeclarationType.default },
      } as unknown as NavFormType;

      const feltMap = createFeltMapFromSubmission(
        formWithoutIntroPage,
        { data: {} } as Submission,
        'digital',
        mockTranslate,
      );

      expect(feltMap).toContain('"label":"Erklæring"');
      expect(feltMap).not.toContain('Jeg bekrefter at jeg vil svare så riktig som jeg kan');
      expect(feltMap).toContain('Jeg bekrefter at opplysningene er riktige.');
    });
  });
});
