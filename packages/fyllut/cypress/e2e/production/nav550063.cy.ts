/*
 * Production form tests for Avtale om barnebidrag for barn over 18 år
 * Form: nav550063
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om bidragsmottaker (opplysningerOmBidragsmottakerBarnetOver18ar): 7 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fnrfield, fødselsdato, borDuINorge
 *       borDuINorge → vegadresseEllerPostboksadresse, navSkjemagruppeUtland
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse / navSkjemagruppePostboksadresse
 *   - Opplysninger om bidragpliktige (opplysningerOmBidragspliktige): 7 same-panel conditionals (mirror of above)
 *   - Oppgjør (oppgjor): 1 same-panel conditional
 *       erDetteEnNyAvtale → dagensOppgjorsform
 *   - Andre bestemmelser (andreBestemmelser): 1 same-panel conditional
 *       erDetAndreBestemmelserITilknytningTilAvtalen → andreBestemmelserForAvtalen
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 cross-panel conditional from andreBestemmelser
 *       erDetAndreBestemmelserITilknytningTilAvtalen → andreBestemmelserTilknyttetAvtalen
 */

describe('nav550063', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opplysninger om bidragsmottaker – fnr og adresse', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550063/opplysningerOmBidragsmottakerBarnetOver18ar?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field and hides fødselsdato when har fnr = Ja', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Bidragsmottakers fødselsdato (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByLabelText('Bidragsmottakers fødselsdato (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
    });

    it('shows fødselsdato and Norway question when har fnr = Nei', () => {
      cy.findByLabelText('Bidragsmottakers fødselsdato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Bor bidragsmottaker i Norge?').should('not.exist');

      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bidragsmottakers fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Bor bidragsmottaker i Norge?').should('exist');
    });

    it('shows address type selector when bor i Norge = Ja', () => {
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen til bidragsmottaker en vegadresse eller postboksadresse?').should(
        'not.exist',
      );

      cy.withinComponent('Bor bidragsmottaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen til bidragsmottaker en vegadresse eller postboksadresse?').should('exist');
    });

    it('shows vegadresse fields when vegadresse selected and postboks fields when postboksadresse selected', () => {
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor bidragsmottaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Er kontaktadressen til bidragsmottaker en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen til bidragsmottaker en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('shows utenlandsk adresse when bor ikke i Norge', () => {
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Bor bidragsmottaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Opplysninger om bidragpliktige – fnr og adresse', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550063/opplysningerOmBidragspliktige?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when har fnr = Ja and hides fødselsdato', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Den bidragspliktiges fødselsdato (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har den bidragspliktige norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByLabelText('Den bidragspliktiges fødselsdato (dd.mm.åååå)').should('not.exist');
    });

    it('shows fødselsdato and Norway question when har fnr = Nei', () => {
      cy.withinComponent('Har den bidragspliktige norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Den bidragspliktiges fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Bor den bidragspliktige i Norge?').should('exist');
    });

    it('shows address type and utenlandsk adresse based on borDuINorge', () => {
      cy.withinComponent('Har den bidragspliktige norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.withinComponent('Bor den bidragspliktige i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen til den bidragspliktige en vegadresse eller postboksadresse?').should(
        'exist',
      );

      cy.withinComponent('Bor den bidragspliktige i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen til den bidragspliktige en vegadresse eller postboksadresse?').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Oppgjør – ny avtale conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550063/oppgjor?sub=paper');
      cy.defaultWaits();
    });

    it('shows current settlement form only when existing agreement (Nei)', () => {
      cy.findByLabelText('Hvilken oppgjørsform har dere i dag?').should('not.exist');

      cy.withinComponent('Er dette en ny avtale?', () => {
        cy.findByRole('radio', { name: 'Nei, det er en endring av eksisterende avtale.' }).click();
      });

      cy.findByLabelText('Hvilken oppgjørsform har dere i dag?').should('exist');
    });

    it('hides current settlement form for new agreement (Ja)', () => {
      cy.withinComponent('Er dette en ny avtale?', () => {
        cy.findByRole('radio', { name: 'Ja.' }).click();
      });

      cy.findByLabelText('Hvilken oppgjørsform har dere i dag?').should('not.exist');
    });
  });

  describe('Andre bestemmelser – conditional textarea', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550063/andreBestemmelser?sub=paper');
      cy.defaultWaits();
    });

    it('shows additional terms textarea when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Andre bestemmelser tilknyttet avtalen' }).should('not.exist');

      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Andre bestemmelser tilknyttet avtalen' }).should('exist');
    });

    it('hides additional terms textarea when nei is selected', () => {
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Andre bestemmelser tilknyttet avtalen' }).should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachment from Andre bestemmelser', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550063/andreBestemmelser?sub=paper');
      cy.defaultWaits();
    });

    it('shows andreBestemmelser attachment in Vedlegg when ja selected', () => {
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Andre bestemmelser tilknyttet avtalen/ }).should('exist');
    });

    it('hides andreBestemmelser attachment in Vedlegg when nei selected', () => {
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Andre bestemmelser tilknyttet avtalen/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550063?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, skip
      cy.clickNextStep();

      // Opplysninger om bidragsmottaker – choose fnr path (no address required)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har bidragsmottaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Opplysninger om bidragpliktige – choose fnr path (no address required)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har den bidragspliktige norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Opplysninger om bidrag – fill the datagrid row
      cy.findByLabelText('Bidrag per måned').type('2000');
      cy.findByRole('textbox', { name: /f\.o\.m\./ }).type('01.2026');
      cy.findByRole('textbox', { name: /t\.o\.m\./ }).type('12.2026');
      cy.clickNextStep();

      // Oppgjør – new agreement, private settlement
      cy.withinComponent('Er dette en ny avtale?', () => {
        cy.findByRole('radio', { name: 'Ja.' }).click();
      });
      cy.withinComponent('Hvilken oppgjørsform ønskes nå?', () => {
        cy.findByRole('radio', { name: 'Vi ønsker å gjøre opp bidraget oss i mellom (privat).' }).click();
      });
      cy.clickNextStep();

      // Andre bestemmelser – no additional terms
      cy.withinComponent('Er det andre bestemmelser tilknyttet avtalen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg – andreBestemmelserTilknyttetAvtalen is hidden (nei selected above)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om bidragsmottaker (barnet over 18 år)', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Oppgjør', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er dette en ny avtale?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
