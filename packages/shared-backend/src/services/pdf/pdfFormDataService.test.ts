import {
  DeclarationType,
  NavFormType,
  Submission,
  SummaryActivity,
  SummaryComponent,
  SummaryDataGrid,
  SummaryDataGridRow,
  SummaryFieldset,
  SummaryFieldsetType,
  SummaryPanel,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import pdfFormDataService from './pdfFormDataService';

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

const createComponent = (label: string, value: unknown, type = 'textfield', optionalProps = {}) =>
  ({
    label,
    value,
    type,
    key: label,
    ...optionalProps,
  }) as SummaryComponent;

const translate = (text?: string) => text ?? '';

describe('pdfFormDataService', () => {
  describe('createPdfDataList', () => {
    it('maps nested panels and datagrids', () => {
      const list = pdfFormDataService.createPdfDataList([
        createPanel('Panel', [
          createContainer('Fieldset', 'fieldset', [createComponent('Field', 'value')]),
          createContainer('My datagrid', 'datagrid', [
            createContainer('My datagrid row 1', 'datagrid-row', [createComponent('Field 1', 'value 1')]),
            createContainer('My datagrid row 2', 'datagrid-row', [createComponent('Field 2', 'value 2')]),
          ]),
        ]),
      ]);

      const listString = JSON.stringify(list);
      expect(listString).toContain('Panel');
      expect(listString).toContain('Field');
      expect(listString).toContain('value');
      expect(listString).toContain('My datagrid');
      expect(listString).toContain('My datagrid row 1');
      expect(listString).toContain('Field 2');
      expect(listString).toContain('value 2');
    });

    it('normalizes tabs in string values', () => {
      const list = pdfFormDataService.createPdfDataList([
        createPanel('Panel', [
          createContainer('Fieldset', 'fieldset', [
            createComponent('Field', 'line 1\n\tIndented line'),
            createComponent('Field', 'another\tvalue'),
          ]),
        ]),
      ]);

      const listString = JSON.stringify(list);
      expect(listString).toContain('line 1\\n  Indented line');
      expect(listString).toContain('another  value');
      expect(listString).not.toContain('\\t');
    });

    it('maps special summary component types', () => {
      const list = pdfFormDataService.createPdfDataList([
        createPanel('Panel', [
          createComponent('Html', '<p>Hello</p>', 'htmlelement'),
          createComponent('Choices', ['A', 'B'], 'selectboxes'),
          createComponent('Activity', { text: 'Activity text' } as SummaryActivity['value'], 'activities'),
          createComponent('Address', { adresse: 'Street 1', postnummer: '1234', bySted: 'Town' }, 'navAddress'),
          createComponent('Attachment', { description: 'Attached file' }, 'attachment'),
        ]),
      ]);

      const listString = JSON.stringify(list);
      expect(listString).toContain('"visningsVariant":"HTML"');
      expect(listString).toContain('"visningsVariant":"PUNKTLISTE"');
      expect(listString).toContain('Activity text');
      expect(listString).toContain('[object Object]');
      expect(listString).toContain('Attached file');
    });
  });

  describe('createPdfFormDataFromSubmission', () => {
    it('creates pdf form data with default language and declaration', () => {
      const form = {
        title: 'Abc def',
        components: [],
        properties: {
          skjemanummer: 'NAV 11-12.15B',
          signatures: [],
          declarationType: DeclarationType.default,
        },
      } as unknown as NavFormType;

      const pdfFormData = pdfFormDataService.createPdfFormDataFromSubmission({
        form,
        submission: { data: {} } as Submission,
        submissionMethod: 'digital',
        translate,
        gitVersion: 'git version',
      });

      expect(pdfFormData.label).toBe('Abc def');
      expect(pdfFormData.pdfConfig?.språk).toBe('nb');
      expect(pdfFormData.bunntekst?.lowerMiddle).toContain('git version');
      expect(JSON.stringify(pdfFormData)).toContain(TEXTS.statiske.declaration.defaultText);
    });

    it('uses provided language and watermark settings', () => {
      const form = {
        title: 'Abc def',
        components: [],
        properties: { skjemanummer: 'NAV 11-12.15B', signatures: [] },
      } as unknown as NavFormType;

      const pdfFormData = pdfFormDataService.createPdfFormDataFromSubmission({
        form,
        submission: { data: {} } as Submission,
        submissionMethod: 'digital',
        translate,
        language: 'nn',
        gitVersion: 'git version',
        isDelingslenke: true,
      });

      expect(pdfFormData.pdfConfig?.språk).toBe('nn');
      expect(pdfFormData.vannmerke).toBe('Testskjema - Ikke send til Nav');
    });

    it('uses intro page self declaration when enabled', () => {
      const form = {
        title: 'Abc def',
        components: [],
        properties: { skjemanummer: 'NAV 11-12.15B', signatures: [] },
        introPage: {
          enabled: true,
          selfDeclaration: 'introPage.selfDeclaration.description.alt1',
        },
      } as unknown as NavFormType;

      const pdfFormData = pdfFormDataService.createPdfFormDataFromSubmission({
        form,
        submission: { data: {} } as Submission,
        submissionMethod: 'digital',
        translate,
      });

      expect(JSON.stringify(pdfFormData)).toContain('introPage.selfDeclaration.inputLabel');
      expect(JSON.stringify(pdfFormData)).not.toContain(TEXTS.statiske.declaration.defaultText);
    });

    it('keeps identity numbers unformatted in summary-based mapping', () => {
      const form = {
        title: 'Abc def',
        components: [
          {
            key: 'panel',
            label: 'Panel',
            type: 'panel',
            components: [
              {
                key: 'fnrfield',
                label: 'fnrfield',
                type: 'fnrfield',
                input: true,
              },
            ],
          },
        ],
        properties: { skjemanummer: 'NAV 11-12.15B', signatures: [] },
      } as unknown as NavFormType;

      const pdfFormData = pdfFormDataService.createPdfFormDataFromSubmission({
        form,
        submission: { data: { fnrfield: '12345678901' } } as Submission,
        submissionMethod: 'digital',
        translate,
      });

      expect(JSON.stringify(pdfFormData)).toContain('12345678901');
    });
  });
});
