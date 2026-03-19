/*
 * Production form tests for Refusjon av utgifter til daglig reise med bruk av egen bil
 * Form: nav111224b
 * Submission types: PAPER, DIGITAL
 *
 * Panels:
 *   - Veiledning (veiledning1): 1 required checkbox, no conditionals
 *   - Kjøreliste (page4): drivinglist + maalgruppe, no required fields
 *   - Dine opplysninger (personopplysninger): 4 same-panel conditionals
 *       identitet.harDuFodselsnummer "nei" → adresse (navAddress) shows
 *       identitet.harDuFodselsnummer "ja"  → alertstripe shows (folkeregistrert-adresse info)
 *       adresse.borDuINorge "nei"           → adresseVarighet shows (Gyldig fra / Gyldig til)
 *       adresse.borDuINorge "ja" + addr     → adresseVarighet shows
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — last panel (Case A)
 *       dokumentasjonAvParkeringsutgifter: conditional on parking > 100 kr/day in drivinglist
 *       annenDokumentasjon: always shown
 *
 * Note: Vedlegg has isAttachmentPanel=true and is the last panel (Case A).
 * Summary flow: fill veiledning1 + page4 + personopplysninger via clickNextStep,
 * then use stepper to visit Vedlegg, fill attachment, 1×clickNextStep → Oppsummering.
 */

describe('nav111224b', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111224b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when no Norwegian identity number', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
    });

    it('shows folkeregistrert-adresse alert when Norwegian identity number is confirmed', () => {
      cy.contains('Nav sender svar på søknad').should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Nav sender svar på søknad').should('exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('Nav sender svar på søknad').should('not.exist');
    });
  });

  describe('Dine opplysninger – address validity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111224b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address validity dates when living outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111224b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check required declaration
      cy.findByRole('checkbox', {
        name: /Jeg er kjent med at jeg kan miste retten til stønad/,
      }).check();
      cy.clickNextStep();

      // Kjøreliste – drivinglist component requires date range and at least one travel day checked
      cy.findByRole('textbox', { name: /Velg første dato/ }).type('01.01.2025');
      cy.findByRole('group', { name: 'Skal du registrere parkering?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      // Expand the created period accordion and check the first travel day
      cy.findByRole('button', { name: /januar 2025/ }).click();
      cy.findAllByRole('checkbox').first().check();
      cy.clickNextStep();

      // Dine opplysninger – Norwegian identity path (navAddress + addressValidity stay hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('17912099997');

      // Vedlegg – isAttachmentPanel=true, last panel (Case A): use stepper, then 1×clickNextStep
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // ONE clickNextStep – Vedlegg is the last panel, goes directly to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
