/*
 * Tests datagrid component
 */
describe('Datagrid', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Optional fields in datagrid', () => {
    it('does not reset values in react rendered fields inside datagrid when adding a new row', () => {
      cy.visit('/fyllut/datagridreact?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('checkbox', { name: 'Avkryssingsboks inni datagrid (valgfritt)' }).check();
      cy.findByRole('textbox', { name: 'Dato inni datagrid' }).type('15.01.2022');
      cy.findByRole('combobox', { name: 'Nedtrekksmeny inni datagrid' }).type('F{enter}');
      cy.findByRole('radio', { name: 'Nei' }).check();
      cy.findByRole('textbox', { name: 'Tekstområde inni datagrid' }).type('Lorem Ipsum');
      cy.findByRole('textbox', { name: 'Tekstfelt inni datagrid' }).type('Hund');
      cy.findByRole('textbox', { name: 'IBAN' }).type('NO9386011117947');
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRoleWhenAttached('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.clickEditAnswers();

      // check original values
      cy.findByRole('checkbox', { name: 'Avkryssingsboks inni datagrid (valgfritt)' }).should('be.checked');
      cy.findByRole('textbox', { name: 'Dato inni datagrid' }).should('have.value', '15.01.2022');
      cy.findByText('Ferge').should('be.visible');
      cy.findByText('Buss').should('not.exist');
      cy.findByRole('radio', { name: 'Nei' }).should('be.checked');
      cy.findByRole('textbox', { name: 'Tekstområde inni datagrid' }).should('have.value', 'Lorem Ipsum');
      cy.findByRole('textbox', { name: 'Tekstfelt inni datagrid' }).should('have.value', 'Hund');
      cy.findByRole('textbox', { name: 'IBAN' }).should('have.value', 'NO93 8601 1117 947');

      // change values
      cy.findByRole('checkbox', { name: 'Avkryssingsboks inni datagrid (valgfritt)' }).click();
      cy.findByRole('textbox', { name: 'Dato inni datagrid' }).type('{selectall}24.12.1999');
      cy.findByRole('combobox', { name: 'Nedtrekksmeny inni datagrid' }).type('Bu{enter}');
      cy.findByRole('radio', { name: 'Ja' }).check();
      cy.findByRole('textbox', { name: 'Tekstområde inni datagrid' }).type('{selectall}En vegg av tekst');
      cy.findByRole('textbox', { name: 'Tekstfelt inni datagrid' }).type('{selectall}Katt');
      cy.findByRole('textbox', { name: 'IBAN' }).type('{selectall}NO9384011117333');

      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.findAllByRole('button', { name: 'Fjern' }).last().click();

      // check that no values were reset to original
      cy.findByRole('checkbox', { name: 'Avkryssingsboks inni datagrid (valgfritt)' }).should('not.be.checked');
      cy.findByRole('textbox', { name: 'Dato inni datagrid' }).should('have.value', '24.12.1999');
      cy.findByText('Ferge').should('not.exist');
      cy.findByText('Buss').should('be.visible');
      cy.findByRole('radio', { name: 'Ja' }).should('be.checked');
      cy.findByRole('textbox', { name: 'Tekstområde inni datagrid' }).should('have.value', 'En vegg av tekst');
      cy.findByRole('textbox', { name: 'Tekstfelt inni datagrid' }).should('have.value', 'Katt');
      cy.findByRole('textbox', { name: 'IBAN' }).should('have.value', 'NO93 8401 1117 333');
    });

    it('does not trigger validation error on optional fields in datagrid rows (if datagrid has required: false)', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByText('For å gå videre må du rette opp følgende:').should('not.exist');
      cy.findByText('Dette er ikke et gyldig kontonummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig organisasjonsnummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig fødselsnummer eller D-nummer').should('not.exist');
    });

    it('does not display empty datagrid rows on summary page', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
      cy.get('.data-grid__row').should('not.exist');
    });
  });

  describe('Datagrid inside container', () => {
    it('displays fields on summary page', () => {
      cy.visit('/fyllut/containerdatagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.clickSaveAndContinue();
      cy.findByRole('group', { name: 'Vis beholder med repeterende data' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('textbox', { name: 'Tekstfelt i datagrid' }).type('Sjokolade');
      cy.findByRole('textbox', { name: 'Dato i datagrid' }).type('12.02.2024');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByText('Sjokolade').shouldBeVisible();
      cy.findByText('12.02.2024').shouldBeVisible();
    });

    it('gets populated with values from mellomlagring', () => {
      cy.mocksUseRouteVariant('get-soknad:containerdatagrid123-complete');
      cy.visit(
        '/fyllut/containerdatagrid123/oppsummering?sub=digital&innsendingsId=b5ea6d20-cc84-4562-9051-ecd5d9a24220',
      );
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByText('Tekstfelt-verdi').shouldBeVisible();
      cy.findByText('31.12.2025').shouldBeVisible();
      cy.findByText('Tekstfelt-verdi2').shouldBeVisible();
      cy.findByText('31.12.2026').shouldBeVisible();
    });
  });
});
