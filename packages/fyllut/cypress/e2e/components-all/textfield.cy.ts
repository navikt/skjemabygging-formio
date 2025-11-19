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
      const label = 'Tekstfelt';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).should('be.visible');
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('Textfield with description', () => {
      const label = 'Tekstfelt med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).should('be.visible');
      });
    });

    it('Textfield with properties', () => {
      const label = 'Tekstfelt med egenskaper';
      cy.findByLabelText(label).should('have.attr', 'autocomplete', 'name');
      cy.findByLabelText(label).should('have.attr', 'spellcheck', 'true');
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
      cy.findByLabelText(label).should('have.value', '');
      cy.findByRole('textbox', { name: 'Tekstfelt A' }).type(a);
      cy.findByLabelText(label).should('have.value', a);
      cy.findByRole('textbox', { name: 'Tekstfelt B' }).type(b);
      cy.findByLabelText(label).should('have.value', a + b);
      cy.findByLabelText(label).should('have.attr', 'readonly');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/validering?sub=paper');
      cy.defaultWaits();
    });

    it('Textfield with required', () => {
      const label = 'Tekstfelt påkrevd';
      cy.clickNextStep();
      cy.findByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('asdf');
      cy.findByErrorMessageRequired(label).should('have.length', 0);
    });

    it('Textfield without required', () => {
      const label = 'Tekstfelt ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findByErrorMessageRequired(label).should('have.length', 0);
    });

    it('Textfield only numbers', () => {
      const label = 'Tekstfelt kun siffer';
      const errorMessage = `${label} kan bare inneholde tall`;
      cy.findByLabelText(label).type('abc');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.focused().clear();
      cy.focused().type('123');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('Textfield min length', () => {
      const label = 'Tekstfelt min og max lengde';
      cy.findByLabelText(label).type('a');
      cy.clickNextStep();
      cy.findByErrorMessageMinLength(label).should('have.length', 2);
      cy.clickErrorMessageMinLength(label);
      cy.focused().clear();
      cy.focused().type('abcde');
      cy.clickErrorMessageMinLength(label).should('have.length', 0);
    });

    it('Textfield max length', () => {
      const label = 'Tekstfelt min og max lengde';
      cy.findByLabelText(label).type('abcdefghij');
      cy.clickNextStep();
      cy.findByErrorMessageMaxLength(label).should('have.length', 2);
      cy.clickErrorMessageMaxLength(label);
      cy.focused().clear();
      cy.focused().type('abcd');
      cy.clickErrorMessageMaxLength(label).should('have.length', 0);
    });

    it('Textfield custom validation', () => {
      const label = 'Tekstfelt må være abc';
      const errorMessage = 'abc er eneste lovlige verdien';
      cy.findByLabelText(label).type('ab');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.focused().clear();
      cy.focused().type('abc');
      cy.findAllByText(errorMessage).should('have.length', 0);
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
      cy.findByRole('textbox', { name: 'Tekstfelt må være abc' }).type('abc');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt');
        cy.get('dd').eq(0).should('contain.text', 'vis1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstfelt med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'vis2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstfelt med egenskaper');
        cy.get('dd').eq(2).should('contain.text', 'vis3');
      });
      cy.withinSummaryGroup('Data', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt A');
        cy.get('dd').eq(0).should('contain.text', 'data1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstfelt B');
        cy.get('dd').eq(1).should('contain.text', 'data2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstfelt A+B');
        cy.get('dd').eq(2).should('contain.text', 'data1data2');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'valid1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstfelt ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'valid2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstfelt kun siffer');
        cy.get('dd').eq(2).should('contain.text', '123');
        cy.get('dt').eq(3).should('contain.text', 'Tekstfelt min og max lengde');
        cy.get('dd').eq(3).should('contain.text', 'valid3');
        cy.get('dt').eq(4).should('contain.text', 'Tekstfelt må være abc');
        cy.get('dd').eq(4).should('contain.text', 'abc');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('Textfield with description, english', () => {
      const label = 'Tekstfelt med beskrivelse (en)';
      const additionalDescription = 'Dette er utvidet beskrivelse (en)';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains(additionalDescription).should('be.visible');
      });
    });
  });
});
