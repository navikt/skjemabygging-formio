import { FormPropertiesType, NavFormType, Submission, Summary } from '@navikt/skjemadigitalisering-shared-domain';
import { body, createHtmlFromSubmission, signatureSection } from './htmlBuilder';

const createContainer = (
  label: string,
  type: Summary.FieldsetType | 'panel' | 'datagrid' | 'datagrid-row',
  components: Summary.Component[] = [],
) =>
  ({
    label,
    components,
    key: label,
    type,
  }) as Summary.Fieldset | Summary.Panel | Summary.DataGrid | Summary.DataGridRow;

const createPanel = (label: string, components: Summary.Component[] = []) =>
  createContainer(label, 'panel', components) as Summary.Panel;

const createComponent = (
  label: string,
  value: Summary.SubmissionValue | string[],
  type = 'textfield',
  optionalProps = {},
) =>
  ({
    label,
    value,
    type,
    key: label,
    ...optionalProps,
  }) as Summary.Component;

const mockTranslate = (text: string) => text;

describe('htmlBuilder', () => {
  describe('createHtmlFromSubmission', () => {
    const formWithTitle = {
      title: 'Abc def',
      components: [],
      properties: { signatures: [] },
    } as unknown as NavFormType;
    let html: String;

    beforeEach(() => {
      html = createHtmlFromSubmission(formWithTitle, { data: {} } as Submission, 'digital', mockTranslate);
    });

    it('creates a html document with the forms title', () => {
      expect(html).toContain('<title>Abc def</title>');
    });

    it('sets norsk Bokmål as language by default', () => {
      expect(html).toContain('xml:lang="nb"');
      expect(html).toContain('lang="nb"');
    });

    it('sets the language from parameter', () => {
      html = createHtmlFromSubmission(formWithTitle, { data: {} } as Submission, 'digital', mockTranslate, 'nn');
      expect(html).toContain('xml:lang="nn"');
      expect(html).toContain('lang="nn"');
    });
  });

  describe('Fields from form and submission', () => {
    const panels = [createPanel('Panel 1'), createPanel('Panel 2'), createPanel('Panel 3')];

    it('adds headers for each top level element in the array', () => {
      const bodyElement = body(panels);
      expect(bodyElement).toContain('<h2>Panel 1</h2>');
      expect(bodyElement).toContain('<h2>Panel 2</h2>');
      expect(bodyElement).toContain('<h2>Panel 3</h2>');
    });

    it('adds fields for each element with a field type in the array', () => {
      const bodyElement = body([
        createPanel('Panel', [createComponent('Field 1', 'value 1'), createComponent('Field 2', 'value 2')]),
      ]);
      expect(bodyElement).toContain('<div class="spm">Field 1</div><div class="svar">: value 1</div>');
      expect(bodyElement).toContain('<div class="spm">Field 2</div><div class="svar">: value 2</div>');
    });
  });

  describe('Container component types', () => {
    describe('fieldset', () => {
      it('adds the fields contained by the fieldset', () => {
        const bodyElement = body([
          createPanel('Panel', [createContainer('Fieldset', 'fieldset', [createComponent('Field', 'value')])]),
        ]);

        expect(bodyElement).toContain('<h2>Panel</h2>');
        expect(bodyElement).not.toContain('<h2>Fieldset</h2>');
        expect(bodyElement).toContain('<div class="spm">Field</div><div class="svar">: value</div>');
      });
    });

    describe('datagrid', () => {
      let bodyElement: string;

      beforeEach(() => {
        bodyElement = body([
          createPanel('Panel', [createContainer('My datagrid', 'datagrid', [createComponent('Field', 'value')])]),
        ]);
      });

      it('adds indentation for fields inside datagrid', () => {
        expect(bodyElement).toContain('<div class="innrykk">');
      });

      it('adds an h3 with the datagrid label', () => {
        expect(bodyElement).toContain('<h3>My datagrid</h3>');
      });

      describe('Containing datagrid rows', () => {
        beforeEach(() => {
          bodyElement = body([
            createPanel('Panel', [
              createContainer('My datagrid', 'datagrid', [
                createContainer('My datagrid row 1', 'datagrid-row', [createComponent('Field 1', 'value 1')]),
                createContainer('My datagrid row 2', 'datagrid-row', [createComponent('Field 2', 'value 2')]),
              ]),
            ]),
          ]);
        });

        it('displays the datagrid row labels', () => {
          expect(bodyElement).toContain('<div class="row-label">My datagrid row 1</div>');
          expect(bodyElement).toContain('<div class="row-label">My datagrid row 2</div>');
        });

        it('displays the contained fields', () => {
          expect(bodyElement).toContain('<div class="spm">Field 1</div><div class="svar">: value 1</div>');
          expect(bodyElement).toContain('<div class="spm">Field 2</div><div class="svar">: value 2</div>');
        });

        it('does not add a second indentation', () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(2);
        });
      });

      describe('Containing a datagrid row with a skjemagruppe', () => {
        beforeEach(() => {
          bodyElement = body([
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
        });

        it('adds double indentation', () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(3);
        });

        it('adds an h4 with the skjemagruppe label, in addition to an h3 and the row label', () => {
          expect(bodyElement).toContain('<h3>My datagrid</h3>');
          expect(bodyElement).toContain('<div class="row-label">My datagrid row</div>');
          expect(bodyElement).toContain('<h4>Skjemagruppe inside datagrid</h4>');
        });

        it('adds the fields in the skjemagruppe', () => {
          expect(bodyElement).toContain('<div class="spm">Field</div><div class="svar">: value</div>');
        });
      });
    });

    describe('navSkjemagruppe', () => {
      let bodyElement: string;

      beforeEach(() => {
        bodyElement = body([
          createPanel('Panel', [
            createContainer('My skjemagruppe', 'navSkjemagruppe', [createComponent('Field', 'value')]),
          ]),
        ]);
      });

      it('adds indentation for fields inside navSkjemagruppe', () => {
        expect(bodyElement).toContain('<div class="innrykk">');
      });

      it('adds an h3 with the skjemagruppe label', () => {
        expect(bodyElement).toContain('<h3>My skjemagruppe</h3>');
      });

      describe('Containing a navSkjemagruppe', () => {
        beforeEach(() => {
          bodyElement = body([
            createPanel('Panel', [
              createContainer('Skjemagruppe level 1', 'navSkjemagruppe', [
                createContainer('Skjemagruppe level 2', 'navSkjemagruppe', [createComponent('Field', 'value')]),
              ]),
            ]),
          ]);
        });

        it('adds double indentation for navSkjemagruppe inside a navSkjemagruppe', () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(3);
        });

        it('adds the h3 for the first skjemagruppe label, and an h4 for the second skjemagruppe', () => {
          expect(bodyElement).toContain('<h3>Skjemagruppe level 1</h3>');
          expect(bodyElement).toContain('<h4>Skjemagruppe level 2</h4>');
        });
      });

      describe('Containing two nested navSkjemagruppe', () => {
        beforeEach(() => {
          bodyElement = body([
            createPanel('Panel', [
              createContainer('Skjemagruppe level 1', 'navSkjemagruppe', [
                createContainer('Skjemagruppe level 2', 'navSkjemagruppe', [
                  createContainer('Skjemagruppe level 3', 'navSkjemagruppe', [createComponent('Field', 'value')]),
                ]),
              ]),
            ]),
          ]);
        });

        it('does not add a third indentation', () => {
          expect(bodyElement.split('<div class="innrykk">')).toHaveLength(3);
        });

        it('adds an h4 for the third nested skjemagruppe', () => {
          expect(bodyElement).toContain('<h4>Skjemagruppe level 3</h4>');
        });
      });
    });
  });

  describe('Special component types', () => {
    describe('image', () => {
      it('adds label image tag and alt text', () => {
        const bodyElement = body([
          createPanel('Panel', [
            createComponent('This is an image', 'data:image/png;base64,image', 'image', {
              alt: 'alt text',
              widthPercent: 40,
            }),
          ]),
        ]);
        expect(bodyElement).toContain(
          `<div>
<div class="spm">This is an image</div>
<img src="data:image/png;base64,image" alt="alt text" width="200"/>
<div class="alt">alt text</div>
</div>`,
        );
      });
    });

    describe('selectboxes', () => {
      it('adds a div for each answer', () => {
        const bodyElement = body([
          createPanel('Panel', [createComponent('Multiple choice', ['Abc', 'Def', 'Ghi'], 'selectboxes')]),
        ]);
        expect(bodyElement).toContain(`<div class="spm">Multiple choice</div>
<div class="svar">: Abc</div><div class="svar">: Def</div><div class="svar">: Ghi</div>`);
      });
    });
  });

  describe('Signatures', () => {
    const expectedSignatureSectionWithSingleSignature = `
<h2>Underskrift</h2>
<p class="underskrift"></p>

<h3></h3>
<div class="underskrift"></div>
<div class="underskrift">Sted og dato _________________________________________</div>
<div class="underskrift">Underskrift _________________________________________</div>
`;

    it('adds a singel signature when form contains the old format', () => {
      const signatures = {
        signature1: '',
        signature2: '',
        signature3: '',
        signature4: '',
        signature5: '',
      };
      const element = signatureSection({ signatures } as FormPropertiesType, 'paper', mockTranslate);
      expect(element).toEqual(expectedSignatureSectionWithSingleSignature);
    });

    it('adds a singel signature', () => {
      const signatures = [{ label: '', description: '', key: 'qwertyuio' }];
      const element = signatureSection({ signatures } as FormPropertiesType, 'paper', mockTranslate);
      expect(element).toEqual(expectedSignatureSectionWithSingleSignature);
    });

    it('adds signatures with labels and description', () => {
      const signatures = [
        { label: 'Søker', description: 'Beskrivelse', key: 'qwertyuio' },
        { label: 'Arbeidsgiver', description: '', key: 'qwertyuio' },
      ];
      const element = signatureSection({ signatures } as FormPropertiesType, 'paper', mockTranslate);

      expect(element).toContain(`
<h3>Søker</h3>
<div class="underskrift">Beskrivelse</div>
<div class="underskrift">Sted og dato _________________________________________</div>
<div class="underskrift">Underskrift _________________________________________</div>`);

      expect(element).toContain(`
<h3>Arbeidsgiver</h3>
<div class="underskrift"></div>
<div class="underskrift">Sted og dato _________________________________________</div>
<div class="underskrift">Underskrift _________________________________________</div>`);
    });

    it('adds description of signatures', () => {
      const signatures = [{ label: '', description: '', key: 'qwertyuio' }];
      const element = signatureSection(
        { signatures, descriptionOfSignatures: 'Description of signatures' } as unknown as FormPropertiesType,
        'paper',
        mockTranslate,
      );
      expect(element).toContain(`<p class="underskrift">Description of signatures</p>`);
    });

    it('does not add signature when submission method is "digital"', () => {
      const signatures = [
        { label: 'Ikke vis meg', description: 'Vises ikke ved digital innsending', key: 'qwertyuio' },
      ];
      const element = signatureSection({ signatures } as FormPropertiesType, 'digital', mockTranslate);
      expect(element).not.toContain('<h2>Underskrift</h2>');
      expect(element).not.toContain('Ikke vis meg');
    });
  });
});
