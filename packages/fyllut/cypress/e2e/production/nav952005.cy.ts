/*
 * Production form tests for Skjema for tips om mulig misbruk av stønad
 * Form: nav952005
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): 1 panel-level conditional
 *       onskerDuATipseAnonymt → Dine opplysninger panel visibility
 *   - Hvem tipset gjelder (hvemtipsetgjelder): 5 same-panel selectbox conditionals
 *       kryssAvForHvilkeOpplysningerDuHarOgKanGiOmPersonenTipsetGjelder → navn, fodselsdatoDdMmAaaa,
 *       harPersonenNorskEllerUtenlandskAdresse, telefonnummer1,
 *       hvaSlagsYtelseRMottarPersonenTipsetGjelder
 *       harPersonenNorskEllerUtenlandskAdresse → norskVegadresse / utenlandskAdresse
 */

describe('nav952005', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Veiledning – anonymous tip panel-level conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952005?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('shows Dine opplysninger only when the tip is not anonymous', () => {
      cy.withinComponent('Ønsker du å tipse anonymt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Hvem tipset gjelder' }).should('exist');

      cy.clickPreviousStep();
      cy.findByRole('heading', { level: 2, name: 'Veiledning' }).should('exist');
      cy.withinComponent('Ønsker du å tipse anonymt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.get('input[type="tel"]').should('have.length', 1);
    });
  });

  describe('Hvem tipset gjelder – selectbox conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952005/hvemtipsetgjelder?sub=paper');
      cy.defaultWaits();
    });

    it('toggles name, birth date, phone, and benefit fields from the selectboxes', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.get('input[type="tel"]').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Hva slags ytelse(r) mottar personen tipset gjelder?',
      }).should('not.exist');

      cy.findByRole('group', {
        name: 'Kryss av for hvilke opplysninger du har og kan gi om personen tipset gjelder',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Navn' }).check();
        cy.findByRole('checkbox', { name: 'Fødselsdato' }).check();
        cy.findByRole('checkbox', { name: 'Telefonnummer' }).check();
        cy.findByRole('checkbox', { name: 'Hva slags ytelse vedkommende mottar' }).check();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');
      cy.get('input[type="tel"]').should('have.length', 1);
      cy.findByRole('textbox', {
        name: 'Hva slags ytelse(r) mottar personen tipset gjelder?',
      }).should('exist');

      cy.findByRole('group', {
        name: 'Kryss av for hvilke opplysninger du har og kan gi om personen tipset gjelder',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Navn' }).uncheck();
        cy.findByRole('checkbox', { name: 'Fødselsdato' }).uncheck();
        cy.findByRole('checkbox', { name: 'Telefonnummer' }).uncheck();
        cy.findByRole('checkbox', { name: 'Hva slags ytelse vedkommende mottar' }).uncheck();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.get('input[type="tel"]').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Hva slags ytelse(r) mottar personen tipset gjelder?',
      }).should('not.exist');
    });

    it('switches between Norwegian and foreign address fields', () => {
      cy.findByLabelText('Har personen norsk eller utenlandsk adresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('not.exist');

      cy.findByRole('group', {
        name: 'Kryss av for hvilke opplysninger du har og kan gi om personen tipset gjelder',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Adresse' }).check();
      });

      cy.findByLabelText('Har personen norsk eller utenlandsk adresse?').should('exist');

      cy.withinComponent('Har personen norsk eller utenlandsk adresse?', () => {
        cy.findByRole('radio', { name: 'Norsk' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('not.exist');

      cy.withinComponent('Har personen norsk eller utenlandsk adresse?', () => {
        cy.findByRole('radio', { name: 'Utenlandsk' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('exist');
      cy.findByRole('textbox', { name: /Postkode/ }).should('exist');
      cy.findByRole('textbox', { name: /By \/ stedsnavn/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      cy.findByRole('group', {
        name: 'Kryss av for hvilke opplysninger du har og kan gi om personen tipset gjelder',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Adresse' }).uncheck();
      });
      cy.findByLabelText('Har personen norsk eller utenlandsk adresse?').should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav952005?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      cy.withinComponent('Ønsker du å tipse anonymt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.get('input[type="tel"]').type('12345678');
      cy.clickNextStep();

      // Hvem tipset gjelder
      cy.findByRole('group', {
        name: 'Kryss av for hvilke opplysninger du har og kan gi om personen tipset gjelder',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Navn' }).check();
        cy.findByRole('checkbox', { name: 'Telefonnummer' }).check();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.get('input[type="tel"]').type('87654321');
      cy.clickNextStep();

      // Innhold i tipset
      cy.findByRole('textbox', { name: 'Forklar hva du ønsker å tipse om' }).type(
        'Jeg ønsker å tipse om mulig misbruk av stønad.',
      );

      // Vedlegg – isAttachmentPanel=true, navigate with stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Etternavn').next('dd').should('contain.text', 'Nordmann');
      });
      cy.withinSummaryGroup('Hvem tipset gjelder', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
        cy.contains('dt', 'Etternavn').next('dd').should('contain.text', 'Nordmann');
      });
      cy.withinSummaryGroup('Innhold i tipset', () => {
        cy.contains('dt', 'Forklar hva du ønsker å tipse om')
          .next('dd')
          .should('contain.text', 'Jeg ønsker å tipse om mulig misbruk av stønad.');
      });
    });
  });
});
