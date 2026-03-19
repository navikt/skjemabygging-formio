/*
 * Production form tests for Opplysningsskjema til Nav for avtalefestet pensjon (AFP)
 * fra Statens pensjonskasse for deg født før 1963
 * Form: nav620016
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Opphold utenfor Norge (oppholdUtenforNorge): 2 same-panel conditionals
 *       harDuBoddEllerArbeidetUtenforNorge → datagrid Land/datoFra/datoTil (when ja)
 *       harDuFlyttetTilNorgeEtterAtDuFylte16Ar → innvandringsdato (when ja)
 *   - Familieforhold (familieforhold): 3 same-panel conditionals + 1 cross-panel
 *       hvaErDinSivilstatus → borDuOgDinEktefellePartnerSammen (when giftPartner)
 *       hvaErDinSivilstatus → erDuSamboer (when ugift/separert/skilt/enkeEnkemann)
 *       erDuSamboer → navSkjemagruppe1 samboerskap details (when ja)
 *       + cross-panel: (erDuSamboer=ja OR hvaErDinSivilstatus=giftPartner) → ektefellePartnerSamboer panel
 *   - Ektefelle, partner, samboer (ektefellePartnerSamboer): 3 same-panel conditionals
 *       harDinEktefellePartnerSamboerNorskFodselsnummerEllerDNummer → fodselsnummerDNummer (when ja)
 *       harDinEktefellePartnerSamboerNorskFodselsnummerEllerDNummer → fodselsdatoDdMmAaaa (when nei)
 *       erInntektenPerArOverToGangerFolketrygdensGrunnbelop2G → oppgiInntektenNarDenErUnder2G (when nei)
 */

describe('nav620016', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opphold utenfor Norge – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav620016/oppholdUtenforNorge?sub=paper');
      cy.defaultWaits();
    });

    it('shows land/dato datagrid when harDuBoddEllerArbeidet is ja', () => {
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent(/Har du bodd eller arbeidet utenfor Norge/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      cy.withinComponent(/Har du bodd eller arbeidet utenfor Norge/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });

    it('shows innvandringsdato when harDuFlyttetTilNorge is ja', () => {
      cy.findByLabelText(/Dato for første gang/).should('not.exist');

      cy.withinComponent('Har du flyttet til Norge etter at du fylte 16 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Dato for første gang/).should('exist');

      cy.withinComponent('Har du flyttet til Norge etter at du fylte 16 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Dato for første gang/).should('not.exist');
    });
  });

  describe('Familieforhold – sivilstatus conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav620016/familieforhold?sub=paper');
      cy.defaultWaits();
    });

    it('shows ektefelle/partner bor-sammen question only when giftPartner', () => {
      cy.findByLabelText('Bor du og din ektefelle/partner sammen?').should('not.exist');

      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Gift/Partner' }).click();
      });
      cy.findByLabelText('Bor du og din ektefelle/partner sammen?').should('exist');

      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Ugift' }).click();
      });
      cy.findByLabelText('Bor du og din ektefelle/partner sammen?').should('not.exist');
    });

    it('shows erDuSamboer question for ugift and hides it for giftPartner', () => {
      cy.findByLabelText('Er du samboer?').should('not.exist');

      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Ugift' }).click();
      });
      cy.findByLabelText('Er du samboer?').should('exist');

      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Gift/Partner' }).click();
      });
      cy.findByLabelText('Er du samboer?').should('not.exist');
    });

    it('shows samboerskap details when erDuSamboer is ja', () => {
      cy.findByLabelText(/Dato for når dere flyttet/).should('not.exist');

      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Ugift' }).click();
      });
      cy.withinComponent('Er du samboer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Dato for når dere flyttet/).should('exist');

      cy.withinComponent('Er du samboer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Dato for når dere flyttet/).should('not.exist');
    });
  });

  describe('Familieforhold – ektefellePartnerSamboer panel visibility', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav620016/familieforhold?sub=paper');
      cy.defaultWaits();
    });

    it('shows Ektefelle, partner, samboer step in stepper when giftPartner', () => {
      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Gift/Partner' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Ektefelle, partner, samboer' }).should('exist');
    });

    it('shows Ektefelle, partner, samboer step in stepper when erDuSamboer is ja', () => {
      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Ugift' }).click();
      });
      cy.withinComponent('Er du samboer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Ektefelle, partner, samboer' }).should('exist');
    });
  });

  describe('Ektefelle, partner, samboer – internal conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav620016/familieforhold?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Gift/Partner' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Ektefelle, partner, samboer' }).click();
    });

    it('toggles fnr field vs fødselsdato based on whether partner has fnr', () => {
      cy.findByLabelText('Fødselsnummer / d-nummer').should('not.exist');
      cy.findByLabelText('Fødselsdato (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har din ektefelle / partner / samboer norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / d-nummer').should('exist');
      cy.findByLabelText('Fødselsdato (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har din ektefelle / partner / samboer norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Fødselsnummer / d-nummer').should('not.exist');
      cy.findByLabelText('Fødselsdato (dd.mm.åååå)').should('exist');
    });

    it('shows income field when partner income is under 2G', () => {
      cy.findByLabelText('Oppgi inntekten per år når den er under 2G').should('not.exist');

      cy.withinComponent(/Er inntekten per år over to ganger/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Oppgi inntekten per år når den er under 2G').should('exist');

      cy.withinComponent(/Er inntekten per år over to ganger/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Oppgi inntekten per år når den er under 2G').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav620016?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – confirm checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Test');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Testesen');
      cy.findByLabelText('Fødselsnummer eller d-nummer').type('17912099997');
      cy.clickNextStep();

      // Uttakstidspunkt for AFP
      cy.findByLabelText(/Fra hvilken måned/).type('01.2026');
      cy.clickNextStep();

      // Inntekter
      cy.findByLabelText(/Brutto arbeidsinntekt i året før uttaket/).type('100000');
      cy.findByLabelText(/Brutto arbeidsinntekt du vil ha i uttaksåret/).type('50000');
      cy.findByLabelText(/Oppgi hvor stor brutto arbeidsinntekt/).type('20000');
      cy.clickNextStep();

      // Opphold utenfor Norge – simplest path: nei for all
      cy.withinComponent(/Har du bodd eller arbeidet utenfor Norge/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du flyttet til Norge etter at du fylte 16 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er du norsk statsborger?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Familieforhold – giftPartner path
      cy.withinComponent('Hva er din sivilstatus?', () => {
        cy.findByRole('radio', { name: 'Gift/Partner' }).click();
      });
      cy.withinComponent('Bor du og din ektefelle/partner sammen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Ektefelle, partner, samboer
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Partner');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Partnersen');
      cy.withinComponent('Har din ektefelle / partner / samboer norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / d-nummer').type('17912099997');
      cy.withinComponent(/Er inntekten per år over to ganger/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Test');
      });
      cy.withinSummaryGroup('Familieforhold', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva er din sivilstatus?');
        cy.get('dd').eq(0).should('contain.text', 'Gift/Partner');
      });
    });
  });
});
