/*
 * Production form tests for Innsøk til Varig tilrettelagt arbeid (VTA)
 * Form: nav761303
 * Submission types: none (no ?sub= param)
 *
 * Panels:
 *   - Veiledning (veiledning): info-only, no required fields, no conditionals
 *   - Brukers opplysninger (personopplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei"), alertstripe (show when "ja")
 *       adresse.borDuINorge → adresseVarighet (show when "nei")
 *   - Tiltaksarrangør (page4): 8 required fields, no conditionals
 *   - Bestilling (page5): 3 required textarea fields, no conditionals
 *   - Vedlegg (vedlegg): isAttachmentPanel=true (last panel); use stepper + 1×clickNextStep
 */

describe('nav761303', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Brukers opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761303/personopplysninger');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section and shows alertstripe when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByText(/Nav sender svar på søknad/).should('exist');
    });

    it('shows adresseVarighet date fields when living abroad', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      // Visit the first required-fields panel directly to bypass the start page and info-only Veiledning
      cy.visit('/fyllut/nav761303/personopplysninger');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Brukers opplysninger – use fnr path (adresse/adresseVarighet not required when fnr is given)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Tiltaksarrangør – fill all 8 required fields
      cy.findByRole('textbox', { name: 'Tiltaksarrangør' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Tiltaksnummer' }).type('123456');
      cy.findByRole('textbox', { name: /Dato for innsøk/ }).type('01.01.2025');
      cy.findByRole('textbox', { name: 'Innsøkende NAV-kontor' }).type('NAV Testkontor');
      cy.findByRole('textbox', { name: 'Fornavn innsøkende NAV-veileder' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn innsøkende NAV-veileder' }).type('Veileder');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /E-post innsøkende/ }).type('test@example.com');
      cy.clickNextStep();

      // Bestilling – fill 3 required textareas; do NOT call clickNextStep (attachment panel is last)
      cy.findByRole('textbox', { name: 'Hva er målet for tiltaksdeltakelsen?' }).type('Teste mål for deltakelse');
      cy.findByRole('textbox', { name: /Eventuelle tilretteleggingsbehov/ }).type('Ingen spesielle behov');
      cy.findByRole('textbox', { name: /Hvilke arbeidsoppgaver/ }).type('Diverse arbeidsoppgaver');

      // Vedlegg – isAttachmentPanel=true (last panel); sequential clickNextStep skips it → use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Relevant dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // ONE clickNextStep – Vedlegg is the last panel, so Next goes directly to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Brukers opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Tiltaksarrangør', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tiltaksarrangør');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
    });
  });
});
