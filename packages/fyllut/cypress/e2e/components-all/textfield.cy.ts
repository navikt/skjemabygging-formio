describe('TextField', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/visning?sub=paper');
      cy.defaultWaits();
    });

    it('Textfield', () => {
      cy.testActive({ label: 'Tekstfelt', role: 'textbox' });
    });

    it('Textfield with description', () => {
      cy.testDescription({ label: 'Tekstfelt med beskrivelse' });
    });

    it('Textfield with properties', () => {
      const label = 'Tekstfelt med egenskaper';
      cy.testAutocomplete({ label, value: 'name' });
      cy.testSpellcheck({ label });
    });
  });

  describe('Data', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/data?sub=paper');
      cy.defaultWaits();
    });

    it('Textfield with calculate value', () => {
      const label = 'Tekstfelt A+B';
      const a = 'a';
      const b = 'b';
      cy.testCalculateValue({ label, value: '' });
      cy.findByRole('textbox', { name: 'Tekstfelt A' }).type(a);
      cy.testCalculateValue({ label, value: a });
      cy.findByRole('textbox', { name: 'Tekstfelt B' }).type(b);
      cy.testCalculateValue({ label, value: a + b });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/validering?sub=paper');
      cy.defaultWaits();
    });

    it('Textfield with required', () => {
      cy.testRequired({ label: 'Tekstfelt påkrevd', value: true, validValue: 'abc' });
    });

    it('Textfield without required', () => {
      cy.testRequired({ label: 'Tekstfelt ikke påkrevd', value: false });
    });

    it('Textfield only numbers', () => {
      const label = 'Tekstfelt kun siffer';
      cy.testValid({
        label,
        invalidValue: 'asdf',
        validValue: '123',
        errorMessage: `${label} kan bare inneholde tall`,
      });
    });

    it('Textfield min and max', () => {
      const label = 'Tekstfelt min og max lengde';
      cy.testMinLength({ label, invalidValue: 'as', validValue: 'asdf' });
      cy.testMaxLength({ label, invalidValue: 'asdfghjk', validValue: 'asdf' });
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield?sub=paper');
      cy.defaultWaits();
    });

    it('Test full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('vis1');
      cy.findByRole('textbox', { name: 'Tekstfelt med beskrivelse' }).type('vis2');
      cy.findByRole('textbox', { name: 'Tekstfelt med egenskaper' }).type('vis3');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Data' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt A' }).type('data1');
      cy.findByRole('textbox', { name: 'Tekstfelt B' }).type('data2');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt påkrevd' }).type('valid1');
      cy.findByRole('textbox', { name: 'Tekstfelt ikke påkrevd (valgfritt)' }).type('valid2');
      cy.findByRole('textbox', { name: 'Tekstfelt kun siffer' }).type('123');
      cy.findByRole('textbox', { name: 'Tekstfelt min og max lengde' }).type('valid3');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.testSummaryGroup({
        name: 'Visning',
        items: [
          { label: 'Tekstfelt', value: 'vis1' },
          { label: 'Tekstfelt med beskrivelse', value: 'vis2' },
          { label: 'Tekstfelt med egenskaper', value: 'vis3' },
        ],
      });
      cy.testSummaryGroup({
        name: 'Data',
        items: [
          { label: 'Tekstfelt A', value: 'data1' },
          { label: 'Tekstfelt B', value: 'data2' },
          { label: 'Tekstfelt A+B', value: 'data1data2' },
        ],
      });
      cy.testSummaryGroup({
        name: 'Validering',
        items: [
          { label: 'Tekstfelt påkrevd', value: 'valid1' },
          { label: 'Tekstfelt ikke påkrevd', value: 'valid2' },
          { label: 'Tekstfelt kun siffer', value: '123' },
          { label: 'Tekstfelt min og max lengde', value: 'valid3' },
        ],
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  // TODO: Translate
  // TODO: Test submission types
});
