/*
 * Production form tests for Søknad om førerhund
 * Form: nav100750
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Søknaden gjelder (soknadenGjelder): 4 same-panel conditionals
 *       hvaSokerDuOm → vetDuNavnetPaMobilitetspedagogEr (and alertstripes)
 *       vetDuNavnetPaMobilitetspedagogEr → navnPaMobilitetspedagog (datagrid)
 *       + 3 cross-panel triggers to Behov and Vedlegg
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Behov (behov): 2 cross-panel conditionals from hvaSokerDuOm
 *       oppgiNavnPaForerhundskolenDuSistFikkHundFra, onskerDuNyHundFraSammeSkoleSomSist
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from hvaSokerDuOm
 *       dokumentasjonPaGjennomfortMobilitetsopplaering1
 */

describe('nav100750', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Søknaden gjelder – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100750/soknadenGjelder?sub=paper');
      cy.defaultWaits();
    });

    it('shows mobilitetspedagog question only for forstegangsSoknad', () => {
      cy.findByRole('group', { name: 'Vet du navnet på mobilitetspedagog(er)?' }).should('not.exist');

      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).check();
      });
      cy.findByRole('group', { name: 'Vet du navnet på mobilitetspedagog(er)?' }).should('exist');

      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Gjenanskaffelse av førerhund og dispensasjon fra forkurs' }).check();
      });
      cy.findByRole('group', { name: 'Vet du navnet på mobilitetspedagog(er)?' }).should('not.exist');
    });

    it('shows mobilitetspedagog datagrid when vet navn på mobilitetspedagog', () => {
      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).check();
      });

      cy.findByRole('group', { name: 'Vet du navnet på mobilitetspedagog(er)?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('textbox', { name: 'Fornavn / Etternavn' }).should('exist');

      cy.findByRole('group', { name: 'Vet du navnet på mobilitetspedagog(er)?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).check();
      });
      cy.findByRole('textbox', { name: 'Fornavn / Etternavn' }).should('not.exist');
    });
  });

  describe('Behov – cross-panel conditionals from hvaSokerDuOm', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100750/soknadenGjelder?sub=paper');
      cy.defaultWaits();
    });

    it('shows gjenanskaffelse-specific fields on behov panel', () => {
      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Gjenanskaffelse av førerhund og dispensasjon fra forkurs' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Behov' }).click();

      cy.findByRole('textbox', { name: 'Oppgi navn på førerhundskolen du sist fikk hund fra' }).should('exist');
      cy.findByRole('group', { name: 'Ønsker du ny hund fra samme skole som sist?' }).should('exist');
    });

    it('hides gjenanskaffelse-specific fields for forstegangsSoknad on behov panel', () => {
      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Behov' }).click();

      cy.findByRole('textbox', { name: 'Oppgi navn på førerhundskolen du sist fikk hund fra' }).should('not.exist');
      cy.findByRole('group', { name: 'Ønsker du ny hund fra samme skole som sist?' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from hvaSokerDuOm', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100750/soknadenGjelder?sub=paper');
      cy.defaultWaits();
    });

    it('shows mobilitetsopplaering attachment for forstegangsSoknad', () => {
      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: 'Dokumentasjon på gjennomført mobilitetsopplæring' }).should('exist');
    });

    it('hides mobilitetsopplaering attachment for gjenanskaffelse', () => {
      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Gjenanskaffelse av førerhund og dispensasjon fra forkurs' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: 'Dokumentasjon på gjennomført mobilitetsopplæring' }).should('not.exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100750/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      // Adresse (including the "Bor du i Norge?" sub-field) is hidden until identity is answered
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).check();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('exist');
    });

    it('keeps adresse section hidden when user has fnr', () => {
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });

      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100750?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – confirm checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      // Søknaden gjelder – forstegangsSoknad path, no mobilitetspedagog name known
      cy.findByRole('group', { name: 'Hva søker du om?' }).within(() => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).check();
      });
      cy.findByRole('group', { name: 'Vet du navnet på mobilitetspedagog(er)?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).check();
      });
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse/adresseVarighet hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/ }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Behov – forstegangsSoknad has no gjenanskaffelse-specific required fields
      cy.findByRole('textbox', {
        name: 'Beskriv i hvilke situasjoner og miljøer det er behov for førerhund',
      }).type('Trenger hjelp til å navigere i trafikken.');
      cy.findByRole('group', { name: 'Ønsker du å søke om grunnstønad til hold av førerhund?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).check();
      });
      cy.clickNextStep();

      // Vedlegg – ettersend all attachments (mobilitetsopplaering shown for forstegangsSoknad)
      cy.findByRole('group', { name: 'Uttalelse fra øyelege' }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
      });
      cy.findByRole('group', { name: 'Legeerklæring om alminnelig helsetilstand' }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
      });
      cy.findByRole('group', { name: 'Dokumentasjon på gjennomført mobilitetsopplæring' }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
      });
      cy.findByRole('group', { name: 'Annen dokumentasjon' }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva søker du om?');
        cy.get('dd').eq(0).should('contain.text', 'Førstegangs søknad om førerhund');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
