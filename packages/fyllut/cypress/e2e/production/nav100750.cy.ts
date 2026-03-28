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
  const visitWithFreshState = (url: string) => {
    cy.clearCookies();
    cy.visit(url, {
      onBeforeLoad: (win) => {
        win.localStorage.clear();
        win.sessionStorage.clear();
      },
    });
    cy.defaultWaits();
  };

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Søknaden gjelder – same-panel conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100750/soknadenGjelder?sub=paper');
    });

    it('shows mobilitetspedagog question only for forstegangsSoknad', () => {
      cy.findByLabelText('Vet du navnet på mobilitetspedagog(er)?').should('not.exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).click();
      });
      cy.findByLabelText('Vet du navnet på mobilitetspedagog(er)?').should('exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Gjenanskaffelse av førerhund og dispensasjon fra forkurs' }).click();
      });
      cy.findByLabelText('Vet du navnet på mobilitetspedagog(er)?').should('not.exist');
    });

    it('shows mobilitetspedagog datagrid when vet navn på mobilitetspedagog', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).click();
      });

      cy.withinComponent('Vet du navnet på mobilitetspedagog(er)?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn / Etternavn' }).should('exist');

      cy.withinComponent('Vet du navnet på mobilitetspedagog(er)?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn / Etternavn' }).should('not.exist');
    });
  });

  describe('Behov – cross-panel conditionals from hvaSokerDuOm', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100750/soknadenGjelder?sub=paper');
    });

    it('shows gjenanskaffelse-specific fields on behov panel', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Gjenanskaffelse av førerhund og dispensasjon fra forkurs' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Behov' }).click();

      cy.findByRole('textbox', { name: 'Oppgi navn på førerhundskolen du sist fikk hund fra' }).should('exist');
      cy.findByLabelText('Ønsker du ny hund fra samme skole som sist?').should('exist');
    });

    it('hides gjenanskaffelse-specific fields for forstegangsSoknad on behov panel', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Behov' }).click();

      cy.findByRole('textbox', { name: 'Oppgi navn på førerhundskolen du sist fikk hund fra' }).should('not.exist');
      cy.findByLabelText('Ønsker du ny hund fra samme skole som sist?').should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from hvaSokerDuOm', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100750/soknadenGjelder?sub=paper');
    });

    it('shows mobilitetsopplaering attachment for forstegangsSoknad', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Dokumentasjon på gjennomført mobilitetsopplæring').should('exist');
    });

    it('hides mobilitetsopplaering attachment for gjenanskaffelse', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Gjenanskaffelse av førerhund og dispensasjon fra forkurs' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Dokumentasjon på gjennomført mobilitetsopplæring').should('not.exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100750/dineOpplysninger?sub=paper');
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps adresse section hidden when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100750?sub=paper');
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – confirm checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      // Søknaden gjelder – forstegangsSoknad path, no mobilitetspedagog name known
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).click();
      });
      cy.withinComponent('Vet du navnet på mobilitetspedagog(er)?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse/adresseVarighet hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Behov – forstegangsSoknad has no gjenanskaffelse-specific required fields
      cy.findByRole('textbox', {
        name: 'Beskriv i hvilke situasjoner og miljøer det er behov for førerhund',
      }).type('Trenger hjelp til å navigere i trafikken.');
      cy.withinComponent('Ønsker du å søke om grunnstønad til hold av førerhund?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg – ettersend all attachments (mobilitetsopplaering shown for forstegangsSoknad)
      cy.findByRole('group', { name: 'Uttalelse fra øyelege' }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: 'Legeerklæring om alminnelig helsetilstand' }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon på gjennomført mobilitetsopplæring/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
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
