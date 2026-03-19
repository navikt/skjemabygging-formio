/*
 * Production form tests for Tilskudd ved kjøp av briller til barn
 * Form: nav100734
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 3 same-panel conditionals
 *       harBarnetVaertHosOptiker → ikkeVaertHosOptiker alertstripe
 *       harBarnetBrilleseddel → jaBrilleseddel / neiBrilleseddel alertstripes
 *       inngaarBrillenIAbonnement → jaBrilleabonnement / neiBrilleabonnement / vetIkkeBrilleabonnement alertstripes
 *   - Innsender (foreldreEllerAnnenVerge): 3 same-panel conditionals
 *       hvemFyllerUtSoknaden → vergeattest2 alertstripe
 *       harDuNorskFodselsnummerEllerDNummer → fnrfield vs datepicker + borDuINorge
 *       borDuINorge → address type choice and foreign address section
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from hvemFyllerUtSoknaden
 *       vergeattest shown only for annenVerge
 */

describe('nav100734', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Veiledning – harBarnetVaertHosOptiker conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows alert when barnet ikke har vært hos optiker', () => {
      cy.contains('enklest for de fleste å få tilskudd').should('not.exist');
      cy.withinComponent('Har barnet vært hos optiker?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('enklest for de fleste å få tilskudd').should('exist');
    });

    it('hides alert when barnet har vært hos optiker', () => {
      cy.withinComponent('Har barnet vært hos optiker?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('enklest for de fleste å få tilskudd').should('not.exist');
    });
  });

  describe('Veiledning – harBarnetBrilleseddel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows brilleseddel-alert when barnet har brilleseddel', () => {
      cy.contains('brilleseddelen sendes inn').should('not.exist');
      cy.withinComponent('Har barnet brilleseddel fra synsundersøkelse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('brilleseddelen sendes inn').should('exist');
    });

    it('shows dokumentasjon-alert when barnet ikke har brilleseddel', () => {
      cy.contains('dokumentasjon fra synsundersøkelse').should('not.exist');
      cy.withinComponent('Har barnet brilleseddel fra synsundersøkelse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('dokumentasjon fra synsundersøkelse').should('exist');
    });
  });

  describe('Veiledning – inngaarBrillenIAbonnement conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows abonnement-warning when brillen inngår i abonnement', () => {
      cy.contains('Det gis kun tilskudd ved kjøp av briller').should('not.exist');
      cy.withinComponent('Inngår brillen i et brilleabonnement?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Det gis kun tilskudd ved kjøp av briller').should('exist');
    });

    it('shows bestilling-info when brillen ikke inngår i abonnement', () => {
      cy.contains('dokumentasjon på at brillen er bestilt').should('not.exist');
      cy.withinComponent('Inngår brillen i et brilleabonnement?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('dokumentasjon på at brillen er bestilt').should('exist');
    });

    it('shows vet-ikke-alert when ukjent abonnementstatus', () => {
      cy.withinComponent('Inngår brillen i et brilleabonnement?', () => {
        cy.findByRole('radio', { name: 'Vet ikke' }).click();
      });
      cy.contains('Det gis kun tilskudd ved kjøp av briller').should('exist');
    });
  });

  describe('Innsender – hvemFyllerUtSoknaden conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/foreldreEllerAnnenVerge?sub=paper');
      cy.defaultWaits();
    });

    it('shows vergeattest-alert when annenVerge fills form', () => {
      cy.contains('Hvis du søker som barnets verge, må du legge ved vergeattest').should('not.exist');
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Barnets verge' }).click();
      });
      cy.contains('Hvis du søker som barnets verge, må du legge ved vergeattest').should('exist');
    });

    it('hides vergeattest-alert when forelder fills form', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Barnets forelder' }).click();
      });
      cy.contains('Hvis du søker som barnets verge, må du legge ved vergeattest').should('not.exist');
    });
  });

  describe('Innsender – harDuNorskFodselsnummerEllerDNummer conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/foreldreEllerAnnenVerge?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnrfield when innsender har norsk fødselsnummer', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').should('exist');
      cy.findByLabelText('Din fødselsdato (dd.mm.åååå)').should('not.exist');
    });

    it('shows datepicker and borDuINorge when innsender ikke har norsk fødselsnummer', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Din fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');
    });
  });

  describe('Innsender – borDuINorge address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/foreldreEllerAnnenVerge?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
    });

    it('shows norsk adresse choice when bor i Norge', () => {
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });

    it('shows utenlandsk adresse when bor ikke i Norge', () => {
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Vedlegg – cross-panel conditional vergeattest from hvemFyllerUtSoknaden', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734/foreldreEllerAnnenVerge?sub=paper');
      cy.defaultWaits();
    });

    it('shows vergeattest attachment for annenVerge', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Barnets verge' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Vergeattest').should('exist');
    });

    it('hides vergeattest attachment for forelder', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Barnets forelder' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Vergeattest').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100734?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – answer screening questions to allow proceeding
      cy.withinComponent('Har barnet vært hos optiker?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har barnet brilleseddel fra synsundersøkelse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Inngår brillen i et brilleabonnement?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Innsender – forelder, has fnr
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Barnets forelder' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').type('17912099997');
      cy.clickNextStep();

      // Barnets opplysninger
      cy.findByLabelText('Fødselsnummer / D-nummer').type('07011601396');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Lille');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.clickNextStep();

      // Vedlegg – forelder path: no vergeattest
      cy.findByRole('group', { name: /Brilleseddel/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon på bestilling av brille/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Innsender', () => {
        cy.contains('dt', 'Hvem fyller ut søknaden?').should('exist');
        cy.contains('dd', 'Barnets forelder').should('exist');
        cy.contains('dt', 'Fornavn').should('exist');
        cy.contains('dd', 'Kari').should('exist');
      });
      cy.withinSummaryGroup('Barnets opplysninger', () => {
        cy.contains('dt', 'Fornavn').should('exist');
        cy.contains('dd', 'Lille').should('exist');
        cy.contains('dt', 'Etternavn').should('exist');
        cy.contains('dd', 'Nordmann').should('exist');
      });
    });
  });
});
