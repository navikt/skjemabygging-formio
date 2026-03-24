import nav760510Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav760510.json';

/*
 * Production form tests for Meldekort for tiltakspenger
 * Form: nav760510
 * Submission types: PAPER
 * introPage.enabled === true — cy.clickIntroPageConfirmation() is required on the root URL.
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 observable customConditional
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Fravær (fravaer): 2 same-panel conditionals
 *       harDuVaertSyk... → fravær day checklist
 *       kryssAvForDageneDuHarHattFravaer → day-specific årsak group
 *   - Lønn (lonn): 1 same-panel conditional
 *       mottarDuLonnIkkeTiltakspengerSomEnDelAvTiltaket → lønnsdager checklist
 *
 * Summary flow covers the intro page and Vedlegg (isAttachmentPanel=true).
 */

const formPath = 'nav760510';

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/${formPath}/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const selectRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillMeldeperiode = () => {
  cy.findByLabelText('Fra uke').type('1');
  cy.findByLabelText('Til uke').type('2');
  cy.findByLabelText('År').type('2025');
  cy.clickNextStep();
};

const fillOppmote = () => {
  cy.findByRole('group', { name: 'Kryss av for de dagene du deltok i tiltaket' }).within(() => {
    cy.findByRole('checkbox', { name: 'Mandag i første uke' }).check();
    cy.findByRole('checkbox', { name: 'Tirsdag i første uke' }).check();
  });
};

describe('nav760510', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', `/fyllut/api/forms/${formPath}*`, { body: nav760510Form });
    cy.intercept('GET', `/fyllut/api/translations/${formPath}*`, { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Dine opplysninger – identity conditional', () => {
    it('shows the address section when the applicant has no Norwegian identity number', () => {
      visitPanel('dineOpplysninger');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps the address section hidden when the applicant has a Norwegian identity number', () => {
      visitPanel('dineOpplysninger');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Fravær conditionals', () => {
    it('shows and hides the fravær checklist when the applicant toggles absence', () => {
      visitPanel('fravaer');
      cy.findByRole('group', { name: 'Kryss av for dagene du har hatt fravær' }).should('not.exist');

      selectRadio(
        'Har du vært syk eller hatt annet fravær noen av dagene du skulle vært på tiltaket?',
        'Ja, jeg har vært syk eller hatt annet fravær',
      );
      cy.findByRole('group', { name: 'Kryss av for dagene du har hatt fravær' }).should('exist');

      selectRadio(
        'Har du vært syk eller hatt annet fravær noen av dagene du skulle vært på tiltaket?',
        'Nei, jeg har ikke vært syk eller hatt annet fravær',
      );
      cy.findByRole('group', { name: 'Kryss av for dagene du har hatt fravær' }).should('not.exist');
    });

    it('shows a day-specific reason question only for checked fravær days', () => {
      visitPanel('fravaer');
      selectRadio(
        'Har du vært syk eller hatt annet fravær noen av dagene du skulle vært på tiltaket?',
        'Ja, jeg har vært syk eller hatt annet fravær',
      );

      cy.findAllByLabelText('Oppgi årsaken til fraværet').should('have.length', 0);

      cy.findByRole('group', { name: 'Kryss av for dagene du har hatt fravær' }).within(() => {
        cy.findByRole('checkbox', { name: 'Mandag i første uke' }).check();
      });
      cy.findAllByLabelText('Oppgi årsaken til fraværet').should('have.length', 1);

      cy.findByRole('group', { name: 'Kryss av for dagene du har hatt fravær' }).within(() => {
        cy.findByRole('checkbox', { name: 'Mandag i første uke' }).uncheck();
      });
      cy.findAllByLabelText('Oppgi årsaken til fraværet').should('have.length', 0);
    });
  });

  describe('Lønn conditional', () => {
    it('shows the lønnsdager checklist only when the applicant receives wages', () => {
      visitPanel('lonn');
      cy.findByRole('group', { name: 'Kryss av for dagene du har mottatt lønn' }).should('not.exist');

      selectRadio('Mottar du lønn (ikke tiltakspenger) som en del av tiltaket?', 'Ja');
      cy.findByRole('group', { name: 'Kryss av for dagene du har mottatt lønn' }).should('exist');

      selectRadio('Mottar du lønn (ikke tiltakspenger) som en del av tiltaket?', 'Nei');
      cy.findByRole('group', { name: 'Kryss av for dagene du har mottatt lønn' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/${formPath}?sub=paper`);
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies the summary page', () => {
      fillDineOpplysninger();
      fillMeldeperiode();

      selectRadio(
        'Har du vært syk eller hatt annet fravær noen av dagene du skulle vært på tiltaket?',
        'Nei, jeg har ikke vært syk eller hatt annet fravær',
      );
      cy.clickNextStep();

      selectRadio('Mottar du lønn (ikke tiltakspenger) som en del av tiltaket?', 'Nei');
      cy.clickNextStep();

      fillOppmote();
      cy.clickNextStep();

      cy.get('body').then(($body) => {
        if (!$body.find('h2#page-title').text().includes('Vedlegg')) {
          cy.clickShowAllSteps();
          cy.findByRole('link', { name: 'Vedlegg' }).click();
        }
      });

      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.get('body').then(($body) => {
        if ($body.find('h2#page-title').text().includes('Vedlegg')) {
          cy.clickNextStep();
        }
      });

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Fravær', () => {
        cy.contains('dd', 'Nei, jeg har ikke vært syk eller hatt annet fravær').should('exist');
      });
      cy.withinSummaryGroup('Lønn', () => {
        cy.contains('dd', 'Nei').should('exist');
      });
    });
  });
});
