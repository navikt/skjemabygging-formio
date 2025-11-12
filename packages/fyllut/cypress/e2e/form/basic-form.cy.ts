/*
 * Tests filling out a basic form with contact information and verifying that the information is displayed in the summary (for both digital/paper)
 */
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const thisYear = new Date().getFullYear();

describe('Basic form', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
  });

  const clickNext = (submissionMethod: 'paper' | 'digital') => {
    if (submissionMethod === 'paper') {
      cy.clickNextStep();
    } else {
      cy.clickSaveAndContinue();
    }
  };

  const fillInForm = (expectVedleggspanel: boolean, submissionMethod: 'paper' | 'digital') => {
    // Steg 1 -> Steg 2
    clickNext(submissionMethod);

    cy.findByRole('combobox', { name: 'Tittel' }).should('exist').click();
    cy.findByText('Fru').should('exist').click();
    cy.findByRole('textbox', { name: 'Fornavn' }).should('exist').type('Kari');
    cy.findByRole('textbox', { name: 'Etternavn' }).should('exist').type('Norman');

    cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller D-nummer?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Nei').should('exist').check();
      });

    cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }).should('exist').type('10.05.1995');
    cy.findByRole('group', { name: 'Bor du i Norge?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Ja').should('exist').check();
      });

    cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Vegadresse').should('exist').check();
      });

    cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist').type('Kirkegata 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('1234');
    cy.findByRole('textbox', { name: 'Poststed' }).should('exist').type('Nesvik');
    cy.findByRole('textbox', { name: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?' })
      .should('exist')
      .type(`01.01.${thisYear}`);
    cy.findByRole('textbox', { name: 'Velg måned' }).should('exist').type(`01.${thisYear}`);

    if (expectVedleggspanel) {
      // Steg 2 -> Steg 3
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.')
        .should('exist')
        .check({ force: true });
    }

    // Step 3 -> Oppsummering
    clickNext(submissionMethod);
    cy.findByRoleWhenAttached('heading', { level: 2, name: 'Oppsummering' }).should('exist');

    // Gå tilbake til skjema fra oppsummering, og naviger til oppsummering på nytt
    // for å verifisere at ingen valideringsfeil oppstår grunnet manglende verdier.
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Veiledning' }).click();

    clickNext(submissionMethod);

    cy.findByRoleWhenAttached('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
    cy.findByRoleWhenAttached('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }).should('exist');
    if (expectVedleggspanel) {
      cy.clickNextStep();
      cy.findByRoleWhenAttached('heading', { level: 2, name: 'Vedlegg' }).should('exist');
    }

    clickNext(submissionMethod);

    // Oppsummering
    cy.findByRoleWhenAttached('heading', { level: 2, name: 'Oppsummering' }).should('exist');
    cy.get('dl')
      .eq(1)
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Tittel');
        cy.get('dd').eq(0).should('contain.text', 'Fru');
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Kari');
        cy.get('dt').eq(2).should('contain.text', 'Etternavn');
        cy.get('dd').eq(2).should('contain.text', 'Norman');
        cy.get('dt').eq(3).should('contain.text', 'Har du norsk fødselsnummer eller D-nummer?');
        cy.get('dd').eq(3).should('contain.text', 'Nei');
        cy.get('dt').eq(4).should('contain.text', 'Din fødselsdato (dd.mm.åååå)');
        cy.get('dd').eq(4).should('contain.text', '10.05.1995');
        if (submissionMethod === 'digital') {
          cy.get('dt').eq(5).should('contain.text', 'Folkeregistrert adresse');
          cy.get('dd').eq(5).should('contain.text', 'Testveien 1C, 1234 Plassen');
        }
        if (submissionMethod === 'paper') {
          cy.get('dt').eq(5).should('not.contain.text', 'Folkeregistrert adresse');
          cy.get('dd').eq(5).should('not.contain.text', 'Testveien 1C, 1234 Plassen');
        }
      });
  };

  describe("submission method 'paper'", () => {
    beforeEach(() => {
      cy.visit('/fyllut/cypress101/skjema?sub=paper');
      cy.defaultWaits();
    });

    it('visits the correct form', () => {
      cy.contains('Skjema for Cucumber-testing').should('not.exist');
      cy.contains('Skjema for Cypress-testing').should('exist');
    });

    describe('Step navigation', () => {
      it("navigates to step 2 when 'neste steg' is clicked", { defaultCommandTimeout: 10000 }, () => {
        cy.findByRole('heading', { level: 2, name: 'Veiledning' }).should('exist');

        cy.clickNextStep();
        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      });

      it('validation errors stops navigation to step 3', () => {
        cy.clickNextStep();
        cy.clickNextStep();
        cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' });
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findAllByRole('link', { name: /Du må fylle ut:/ }).should('have.length', 5);
            cy.findByRole('link', { name: 'Du må fylle ut: Fornavn' }).click();
          });
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.focus');
      });
    });

    describe('Fill in form', () => {
      it('fill in - go to summary - edit form - navigate back to summary', () => {
        fillInForm(true, 'paper');
      });
    });
  });

  describe("submission method 'digital'", () => {
    beforeEach(() => {
      cy.visit('/fyllut/cypress101?sub=digital');
      cy.defaultWaits();
    });

    describe('Fill in form', () => {
      it('fill in - go to summary - edit form - navigate back to summary', () => {
        cy.clickStart();
        cy.wait('@createMellomlagring');
        fillInForm(false, 'digital');
      });
    });
  });

  describe('submission method not specified in url', () => {
    beforeEach(() => {
      cy.visit('/fyllut/cypress101');
      cy.defaultWaits();
    });

    describe('Fill in form', () => {
      it('select submission method paper - fill in - go to summary - edit form - navigate back to summary', () => {
        cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).click();
        cy.findByRole('heading', { name: TEXTS.statiske.introPage.title });
        cy.clickStart();
        fillInForm(true, 'paper');
      });

      it('select submission method digital - fill in - go to summary - edit form - navigate back to summary', () => {
        cy.clickSendDigital();
        cy.findByRole('heading', { name: TEXTS.statiske.introPage.title });
        cy.clickStart();
        cy.wait('@createMellomlagring');
        fillInForm(false, 'digital');
      });
    });
  });
});
