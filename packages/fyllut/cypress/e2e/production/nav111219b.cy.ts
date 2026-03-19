/*
 * Production form tests for Tilleggsstønad - støtte til bolig og overnatting
 * Form: nav111219b
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 2 cross-panel triggers + 1 cross-panel to Vedlegg
 *       hvilkeBoutgifterSokerDuOmAFaDekket → mottarDuBostotteFraKommunen (boutgifter)
 *       mottarDuBostotteFraKommunen → hvorMyeBostotteMottarDu (boutgifter same-panel)
 *       hvilkeBoutgifterSokerDuOmAFaDekket → bostotteIForbindelseMedSamling container (periode)
 *   - Boutgifter (boutgifter): 3 same-panel selectboxes conditionals
 *       hvilkeAdresserHarDuBoutgifterPa → boutgifterPaAktivitetsadressen amount field
 *       hvilkeAdresserHarDuBoutgifterPa → boutgifterPaHjemstedetMitt amount field
 *       hvilkeAdresserHarDuBoutgifterPa → boutgifterOpphort amount field
 *   - Personopplysninger (personopplysninger): 1 row.X customConditional
 *       identitet.harDuFodselsnummer → adresse (navAddress) visibility
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — 4 conditional attachments
 *       hvilkeBoutgifterSokerDuOmAFaDekket → bekreftelsePaAlleSamlingeneDuSkalDeltaPa
 *       hvilkeAdresserHarDuBoutgifterPa → dokumentasjon for aktivitetsadressen
 *       hvilkeAdresserHarDuBoutgifterPa → dokumentasjon for hjemstedet
 *       erDetMedisinskeForholdSomPavirkerUtgifteneDinePaAktivitetsstedet → medisinsk dokumentasjon
 */

describe('nav111219b', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Veiledning – cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111219b/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows mottarDuBostotteFraKommunen on boutgifter for fasteBoutgifter', () => {
      cy.withinComponent('Hvilke boutgifter søker du om å få dekket?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om å få dekket faste boutgifter' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Boutgifter' }).click();

      cy.findByRole('group', { name: /Mottar du bostøtte fra kommunen/ }).should('exist');
    });

    it('shows hvorMyeBostotteMottarDu only when mottarDuBostotteFraKommunen is Ja', () => {
      cy.withinComponent('Hvilke boutgifter søker du om å få dekket?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om å få dekket faste boutgifter' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Boutgifter' }).click();

      cy.findByLabelText('Hvor mye bostøtte mottar du?').should('not.exist');

      cy.withinComponent('Mottar du bostøtte fra kommunen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hvor mye bostøtte mottar du?').should('exist');

      cy.withinComponent('Mottar du bostøtte fra kommunen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Hvor mye bostøtte mottar du?').should('not.exist');
    });

    it('shows periodeForSamling on periode for boutgifterIForbindelseMedSamling', () => {
      cy.withinComponent('Hvilke boutgifter søker du om å få dekket?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om å få dekket boutgifter i forbindelse med samling' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Periode' }).click();

      cy.contains('Periode for samling').should('exist');
    });
  });

  describe('Boutgifter – address-driven conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111219b/boutgifter?sub=paper');
      cy.defaultWaits();
    });

    it('shows boutgifter amount for aktivitetsadressen when that option is checked', () => {
      cy.findByLabelText('Boutgifter på aktivitetsadressen').should('not.exist');

      cy.findByRole('checkbox', { name: /aktivitetsadressen min/ }).click();

      cy.findByLabelText('Boutgifter på aktivitetsadressen').should('exist');

      cy.findByRole('checkbox', { name: /aktivitetsadressen min/ }).click();

      cy.findByLabelText('Boutgifter på aktivitetsadressen').should('not.exist');
    });

    it('shows boutgifter amount for hjemstedet when that option is checked', () => {
      cy.findByLabelText('Boutgifter på hjemstedet ditt').should('not.exist');

      cy.findByRole('checkbox', { name: /fortsatt boutgifter på hjemstedet mitt/ }).click();

      cy.findByLabelText('Boutgifter på hjemstedet ditt').should('exist');
    });

    it('shows boutgifter amount for opphørte boutgifter when that option is checked', () => {
      cy.findByLabelText(/Boutgifter du har hatt på hjemstedet ditt/).should('not.exist');

      cy.findByRole('checkbox', { name: /hatt boutgifter på hjemstedet mitt/ }).click();

      cy.findByLabelText(/Boutgifter du har hatt på hjemstedet ditt/).should('exist');
    });
  });

  describe('Personopplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111219b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when harDuFodselsnummer is Nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section when harDuFodselsnummer is Ja', () => {
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachments', () => {
    it('shows bekreftelsePaAlleSamlinger for boutgifterIForbindelseMedSamling', () => {
      cy.visit('/fyllut/nav111219b/veiledning?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Hvilke boutgifter søker du om å få dekket?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om å få dekket boutgifter i forbindelse med samling' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Bekreftelse på alle samlingene du skal delta på/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av boutgifter du har på aktivitetsadressen/ }).should('not.exist');
    });

    it('shows dokumentasjon for aktivitetsadressen when that address is selected', () => {
      cy.visit('/fyllut/nav111219b/boutgifter?sub=paper');
      cy.defaultWaits();

      cy.findByRole('checkbox', { name: /aktivitetsadressen min/ }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av boutgifter du har på aktivitetsadressen/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av boutgifter du har på hjemstedet ditt/ }).should('not.exist');
    });

    it('shows dokumentasjon for hjemstedet when that address is selected', () => {
      cy.visit('/fyllut/nav111219b/boutgifter?sub=paper');
      cy.defaultWaits();

      cy.findByRole('checkbox', { name: /fortsatt boutgifter på hjemstedet mitt/ }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av boutgifter du har på hjemstedet ditt/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av boutgifter du har på aktivitetsadressen/ }).should('not.exist');
    });

    it('shows medisinsk dokumentasjon when erDetMedisinskeForhold is Ja', () => {
      cy.visit('/fyllut/nav111219b/boutgifter?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Er det medisinske forhold som påvirker utgiftene dine på aktivitetsstedet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av medisinske forhold som påvirker utgiftene/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.defaultInterceptsExternal();
      cy.visit('/fyllut/nav111219b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – select fasteBoutgifter
      cy.withinComponent('Hvilke boutgifter søker du om å få dekket?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om å få dekket faste boutgifter' }).click();
      });
      cy.clickNextStep();

      // Personopplysninger – fnr path (adresse and adresseVarighet stay hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din situasjon – select one situation to satisfy required selectboxes
      cy.findByRole('checkbox', { name: /Ingen av situasjonene passer/ }).click();
      cy.clickNextStep();

      // Periode – fill required start and end dates
      cy.findByLabelText('Startdato (dd.mm.åååå)').type('01.01.2025');
      cy.findByLabelText('Sluttdato (dd.mm.åååå)').type('31.01.2025');
      cy.clickNextStep();

      // Boutgifter – fasteBoutgifter path: mottarDuBostotteFraKommunen is visible
      cy.withinComponent('Mottar du bostøtte fra kommunen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('checkbox', { name: /aktivitetsadressen min/ }).click();
      cy.findByLabelText('Boutgifter på aktivitetsadressen').type('5000');
      cy.withinComponent('Er det medisinske forhold som påvirker utgiftene dine på aktivitetsstedet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – no required fields
      cy.clickNextStep();

      // Vedlegg – isAttachmentPanel, use stepper then clickNextStep to summary
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av boutgifter du har på aktivitetsadressen/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
      });
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
