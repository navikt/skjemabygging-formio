describe('Form design layout', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  it('sizes the account-number input without narrowing its label, description, help or error', () => {
    cy.viewport(1024, 800);
    cy.visit('/fyllut/bankaccount/visning?sub=paper');
    cy.defaultWaits();

    cy.get('[data-form-component]').should('exist');
    const label = 'Kontonummer med beskrivelse';
    cy.withinComponent(label, () => {
      cy.findByRole('textbox', { name: label }).should(($input) => {
        const input = $input[0];
        const field = input.closest('[data-component-key]')!;
        const fieldWidth = field.getBoundingClientRect().width;
        const labelElement = field.querySelector(`label[for="${input.id}"]`)!;
        const descriptionId = input.getAttribute('aria-describedby')!.split(' ')[0];
        const description = input.ownerDocument.getElementById(descriptionId)!;

        expect(input.getBoundingClientRect().width).to.be.closeTo(140, 1);
        expect(fieldWidth).to.be.closeTo(640, 1);
        expect(labelElement.getBoundingClientRect().width).to.be.greaterThan(140);
        expect(labelElement.getBoundingClientRect().width).to.be.at.most(fieldWidth);
        expect(description.getBoundingClientRect().width).to.be.greaterThan(140);
        expect(description.getBoundingClientRect().width).to.be.at.most(fieldWidth);
      });
      cy.contains('p', 'Dette er en beskrivelse').should('have.css', 'margin', '0px');
      cy.findByRole('button', { name: 'mer' }).click();
      cy.contains('p', 'Dette er utvidet beskrivelse')
        .should('be.visible')
        .parent()
        .should(($help) => {
          expect($help[0].getBoundingClientRect().width).to.be.greaterThan(140);
        });
    });

    cy.clickNextStep();
    cy.withinComponent(label, () => {
      cy.findByText(`Du må fylle ut: ${label}`).should('be.visible');
      cy.findByRole('textbox', { name: label }).should(($input) => {
        const input = $input[0];
        const describedElements = input
          .getAttribute('aria-describedby')!
          .split(' ')
          .map((id) => input.ownerDocument.getElementById(id)!);
        const error = describedElements.find((element) => element.textContent?.includes(`Du må fylle ut: ${label}`))!;
        const fieldWidth = input.closest('[data-component-key]')!.getBoundingClientRect().width;

        expect(input.getBoundingClientRect().width).to.be.closeTo(140, 1);
        expect(error.getBoundingClientRect().width).to.be.greaterThan(140);
        expect(error.getBoundingClientRect().width).to.be.at.most(fieldWidth);
      });
      cy.findByRole('textbox', { name: label }).type('01234567892');
      cy.findByText(`Du må fylle ut: ${label}`).should('not.exist');
    });
  });

  it('fits two half-width row fields beside each other with one gap and no double bottom margin', () => {
    cy.viewport(1024, 800);
    cy.visit('/fyllut/pengerogkonto/penger?sub=paper');
    cy.defaultWaits();
    cy.wait('@getCurrencies');

    cy.get('[data-component-key="angiValutaOgBelop"]').should(($row) => {
      const row = $row[0];
      const currency = row.querySelector('[data-component-key="valutavelger"]')!;
      const amount = row.querySelector('[data-component-key="belop1"]')!;
      const currencyBounds = currency.getBoundingClientRect();
      const amountBounds = amount.getBoundingClientRect();
      const rowBounds = row.getBoundingClientRect();
      const fields = currency.parentElement!.parentElement!;

      expect(rowBounds.width).to.be.closeTo(640, 1);
      expect(currencyBounds.width).to.be.closeTo((rowBounds.width - 24) / 2, 1);
      expect(amountBounds.width).to.be.closeTo(currencyBounds.width, 1);
      expect(amountBounds.top).to.be.closeTo(currencyBounds.top, 1);
      expect(amountBounds.left - currencyBounds.right).to.be.closeTo(24, 1);
      expect(getComputedStyle(fields).columnGap).to.equal('24px');
      expect(getComputedStyle(fields).rowGap).to.equal('40px');
      expect(getComputedStyle(currency.firstElementChild!).marginBottom).to.equal('0px');
      expect(getComputedStyle(amount.firstElementChild!).marginBottom).to.equal('0px');
      expect(getComputedStyle(row.firstElementChild!).marginBottom).to.equal('40px');
    });
  });

  it('keeps mobile gutters and stacks row fields with one vertical gap without horizontal scrolling', () => {
    cy.viewport(320, 800);
    cy.visit('/fyllut/pengerogkonto/penger?sub=paper');
    cy.defaultWaits();
    cy.wait('@getCurrencies');

    cy.get('[data-component-key="angiValutaOgBelop"]').should(($row) => {
      const row = $row[0];
      const currency = row.querySelector('[data-component-key="valutavelger"]')!;
      const amount = row.querySelector('[data-component-key="belop1"]')!;
      const currencyBounds = currency.getBoundingClientRect();
      const amountBounds = amount.getBoundingClientRect();
      const viewportWidth = row.ownerDocument.documentElement.clientWidth;

      expect(currencyBounds.left).to.be.closeTo(16, 1);
      expect(amountBounds.right).to.be.closeTo(viewportWidth - 16, 1);
      expect(currencyBounds.width).to.be.closeTo(viewportWidth - 32, 1);
      expect(amountBounds.width).to.be.closeTo(currencyBounds.width, 1);
      expect(amountBounds.left).to.be.closeTo(currencyBounds.left, 1);
      expect(amountBounds.top - currencyBounds.bottom).to.be.closeTo(40, 1);
    });
    cy.document().should((document) => {
      expect(document.documentElement.scrollWidth).to.be.at.most(document.documentElement.clientWidth);
    });
  });
});
