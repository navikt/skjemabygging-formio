/*
 * Production form tests for Skadeforklaring ved arbeidsulykke
 * Form: nav130021
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Ulykken (page4): 2 same-panel conditionals
 *       bleLegeOppsoktEtterSkaden → navSkjemagruppe1 (Legens navn og adresse textarea)
 *       varDetVitnerTilHendelsen → navSkjemagruppe2 (Øyenvitners navn og telefon textarea)
 *   - Dokumentasjon NAV har bedt om (page5): 1 cross-panel trigger to Vedlegg
 *       harNavBedtDegSendeInnDokumentasjon → dokumentasjonNavHarBedtOm attachment
 *
 * Note: Vedlegg has isAttachmentPanel=true; sequential clickNextStep() skips it.
 * Navigate to Vedlegg via stepper, then clickNextStep() once to reach Oppsummering.
 */

describe('nav130021', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Ulykken – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav130021/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows Legens navn og adresse when ble lege oppsøkt', () => {
      cy.findByRole('textbox', { name: /Skriv navn på lege/ }).should('not.exist');

      cy.withinComponent('Ble lege / legevakt / sykehus / behandler oppsøkt etter skaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Skriv navn på lege/ }).should('exist');

      cy.withinComponent('Ble lege / legevakt / sykehus / behandler oppsøkt etter skaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Skriv navn på lege/ }).should('not.exist');
    });

    it('shows Øyenvitners navn og telefon when det var vitner', () => {
      cy.findByRole('textbox', { name: /Skriv navn og telefonnummer til vitnet/ }).should('not.exist');

      cy.withinComponent('Var det vitner til hendelsen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Skriv navn og telefonnummer til vitnet/ }).should('exist');

      cy.withinComponent('Var det vitner til hendelsen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Skriv navn og telefonnummer til vitnet/ }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from harNavBedtDegSendeInnDokumentasjon', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav130021/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows dokumentasjon attachment when NAV har bedt om dokumentasjon', () => {
      cy.withinComponent('Har NAV bedt deg sende inn dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon NAV har bedt om/ }).should('exist');
    });

    it('hides dokumentasjon attachment when NAV ikke har bedt om dokumentasjon', () => {
      cy.withinComponent('Har NAV bedt deg sende inn dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon NAV har bedt om/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav130021?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – only HTML content, no required fields
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Ulykken – fill required fields; choose Nei for conditionals to avoid conditional required children
      cy.findByRole('textbox', { name: 'Beskriv hva du arbeidet med i ulykkesøyeblikket' }).type('Arbeidet på lager');
      cy.findByRole('textbox', {
        name: 'Forklar nøye hvor ulykken inntraff, hvordan den skjedde og hva skaden din består i',
      }).type('Falt ned fra stige på lageret');
      cy.withinComponent('Er ulykken etterforsket av politiet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Ble lege / legevakt / sykehus / behandler oppsøkt etter skaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Var det vitner til hendelsen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Dokumentasjon NAV har bedt om – choose Nei so conditional attachment is hidden in Vedlegg
      // Do NOT call clickNextStep here; use stepper to visit Vedlegg (isAttachmentPanel=true)
      cy.withinComponent('Har NAV bedt deg sende inn dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true means sequential Next skips this panel; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // From Vedlegg (last panel), one clickNextStep reaches Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Ulykken', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er ulykken etterforsket av politiet?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
