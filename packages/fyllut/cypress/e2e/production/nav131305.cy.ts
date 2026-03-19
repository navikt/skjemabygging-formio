/*
 * Production form tests for Søknad fra selvstendig næringsdrivende og frilansere om frivillig opptak i NAVs yrkesskadeordning
 * Form: nav131305
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 3 conditionals
 *       identitet.harDuFodselsnummer → adresse visibility (customConditional row.X)
 *       jegHarIkkeTelefonnummer → telefonnummerSoker (simple conditional)
 *   - Virksomheten (virksomheten): 3 same-panel conditionals
 *       harVirksomhetenAdresseINorge → postnr (hides), utenlandskPostkode + land (shows)
 */

describe('nav131305', () => {
  const visitVirksomhetenViaWizard = () => {
    cy.visit('/fyllut/nav131305?sub=paper');
    cy.defaultWaits();
    cy.clickNextStep(); // root → Veiledning
    cy.clickNextStep(); // Veiledning → Dine opplysninger
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Virksomheten' }).click();
    cy.findByRole('textbox', { name: 'Navn på virksomheten (firma)' }).should('exist');
  };

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131305/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when harDuFodselsnummer is Nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section when harDuFodselsnummer is Ja', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('hides telefonnummer when jegHarIkkeTelefonnummer is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();

      cy.findByLabelText('Telefonnummer').should('not.exist');
    });
  });

  describe('Virksomheten – address conditionals', () => {
    beforeEach(() => {
      visitVirksomhetenViaWizard();
    });

    it('shows foreign address fields and hides postnr when virksomhet is abroad', () => {
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Har virksomheten adresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });

    it('shows postnr and hides foreign fields when virksomhet is in Norway', () => {
      cy.withinComponent('Har virksomheten adresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131305?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // root → Veiledning
      cy.clickNextStep(); // Veiledning → Dine opplysninger
    });

    it('fills required fields and verifies summary', () => {
      const now = new Date();
      const today = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

      // Dine opplysninger – use fnr path (adresse hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Virksomheten – Norwegian address
      cy.findByRole('textbox', { name: 'Navn på virksomheten (firma)' }).should('exist');
      cy.findByRole('textbox', { name: 'Navn på virksomheten (firma)' }).type('Kari Nordmann ENK');
      cy.withinComponent('Har virksomheten adresse i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Adresse' }).type('Storgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0181');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Yrkesskadeordning
      cy.findByLabelText('Fra dato (dd.mm.åååå)').type(`${today}{esc}`);
      cy.withinComponent(
        'Har du annen inntekt utenom det du har som selvstendig næringsdrivende og/eller som frilanser ?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByLabelText(/Forventet årsinntekt som selvstendig næringsdrivende/).type('500000');

      // Vedlegg (isAttachmentPanel) – navigate via stepper, then proceed to summary
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Virksomheten', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på virksomheten');
        cy.get('dd').eq(0).should('contain.text', 'Kari Nordmann ENK');
      });
    });
  });
});
