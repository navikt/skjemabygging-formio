/*
 * Production form tests for Krigspensjoneringen - Krav om etterlattepensjon
 * Form: nav310003
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 1 simple conditional
 *       erDuNorskStatsborger → nasjonalitet
 *   - Pensjonsforhold (page4): 2 same-panel conditionals
 *       mottarDuUforepensjonEllerAlderspensjonFraTjenestepensjonsordningEllerFraSosialTrygd
 *         → pensjonsart + navnetPaPensjonsordningYtelse
 *   - Avdødes personalia (page6): 1 same-panel conditional
 *       varAvdodeTidligereFraskilt → detaljerOmTidligereEktefelle
 *   - Forsørgede barn under 21 år (page15): 1 same-panel + 2 cross-panel conditionals to Vedlegg
 *       forsorgerDuBarnUnder21Ar → barnUnder21ArSomDuForsorger datagrid
 *       + cross-panel: forsorgerDuBarnUnder21Ar → aldersattestForBarnUnder21ArSomDuForsorger in Vedlegg
 *       + cross-panel: barnUnder21ArSomDuForsorger[].erBarnetOver18Ar → bekreftelseFra... in Vedlegg
 *   - Bevitnelse (page10): 1 same-panel conditional
 *       harDuSelvFyltUtSoknadenOgKanSignerePaDen → hvemSkalBevitneSoknaden (bevitner fields)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — conditional attachments
 *       aldersattest conditional (forsorgerDuBarnUnder21Ar=ja)
 *       bekreftelse conditional (barnOver18Ar=ja)
 */

describe('nav310003', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – statsborgerskap conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310003/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows nasjonalitet field only when ikke norsk statsborger', () => {
      cy.findByLabelText('Nasjonalitet').should('not.exist');

      cy.withinComponent('Er du norsk statsborger?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Nasjonalitet').should('exist');

      cy.withinComponent('Er du norsk statsborger?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Nasjonalitet').should('not.exist');
    });
  });

  describe('Pensjonsforhold – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310003/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows pensjonsart and pensjonsordning when mottar tjenestepensjon/sosialtrygd', () => {
      cy.findByLabelText('Pensjonsart').should('not.exist');
      cy.findByLabelText('Navnet på pensjonsordning/ytelse').should('not.exist');

      cy.withinComponent(/Mottar du uførepensjon eller alderspensjon/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Pensjonsart').should('exist');
      cy.findByLabelText('Navnet på pensjonsordning/ytelse').should('exist');

      cy.withinComponent(/Mottar du uførepensjon eller alderspensjon/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Pensjonsart').should('not.exist');
      cy.findByLabelText('Navnet på pensjonsordning/ytelse').should('not.exist');
    });
  });

  describe('Avdødes personalia – fraskilt conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310003/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows detaljer om tidligere ektefelle when avdøde var fraskilt', () => {
      cy.findByLabelText('Detaljer om tidligere ektefelle').should('not.exist');

      cy.withinComponent('Var avdøde tidligere fraskilt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Detaljer om tidligere ektefelle').should('exist');

      cy.withinComponent('Var avdøde tidligere fraskilt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Detaljer om tidligere ektefelle').should('not.exist');
    });
  });

  describe('Forsørgede barn – same-panel and cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310003/page15?sub=paper');
      cy.defaultWaits();
    });

    it('shows barn datagrid when forsørger barn under 21', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('shows aldersattest attachment in Vedlegg when forsørger barn under 21', () => {
      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Aldersattest for barn under 21/ }).should('exist');
    });

    it('hides aldersattest attachment in Vedlegg when ikke forsørger barn under 21', () => {
      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Aldersattest for barn under 21/ }).should('not.exist');
    });

    it('shows bekreftelse fra studiested attachment in Vedlegg when barn over 18 år', () => {
      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er barnet over 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Bekreftelse fra studiested/ }).should('exist');
    });

    it('hides bekreftelse fra studiested attachment in Vedlegg when barn ikke over 18 år', () => {
      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er barnet over 18 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Bekreftelse fra studiested/ }).should('not.exist');
    });
  });

  describe('Bevitnelse – signering conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310003/page10?sub=paper');
      cy.defaultWaits();
    });

    it('shows bevitner fields when bruker ikke kan signere selv', () => {
      cy.findByLabelText('Bevitners fornavn').should('not.exist');

      cy.withinComponent(/Har du selv fylt ut søknaden/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bevitners fornavn').should('exist');

      cy.withinComponent(/Har du selv fylt ut søknaden/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bevitners fornavn').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310003?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Er du flyktning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er du norsk statsborger?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Pensjonsforhold – nei path hides conditional textfields
      cy.withinComponent(/Mottar du uførepensjon eller alderspensjon/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Krav
      cy.withinComponent('Hva fremstiller du krav om?', () => {
        cy.findByRole('radio', { name: 'Enkepensjon' }).click();
      });
      cy.clickNextStep();

      // Avdødes personalia – nei path hides detaljer om ektefelle
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Avdød');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Stilling' }).type('Soldat');
      cy.findByRole('textbox', { name: /Dødsdato/ }).type('01.01.2020');
      cy.withinComponent('Var avdøde tidligere fraskilt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Statsborgerskap ved dødsfall' }).type('Norsk');
      cy.findByRole('textbox', { name: /Statsborgerskap da skaden/ }).type('Norsk');
      cy.clickNextStep();

      // Forsørgede barn under 21 år – nei path hides datagrid and conditional attachments
      cy.withinComponent('Forsørger du barn under 21 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – no required fields
      cy.clickNextStep();

      // Erklæring – navCheckbox: use findByRole('checkbox') + .click() to avoid matching the fieldset
      cy.findByRole('checkbox', { name: /Spørsmålene er besvart/ }).click();
      cy.clickNextStep();

      // Bevitnelse – ja path hides bevitner fields
      cy.withinComponent(/Har du selv fylt ut søknaden/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Navigate to Vedlegg via stepper (isAttachmentPanel=true, skipped by sequential clickNextStep)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg – fill always-visible attachments (aldersattest hidden since forsorger=nei)
      cy.findByRole('group', { name: /Vigselsattest/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/ }).click();
      });
      // annenDokumentasjon has no ettersender option (attachmentValues: nei + leggerVedNaa only)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Krav', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva fremstiller du krav om?');
        cy.get('dd').eq(0).should('contain.text', 'Enkepensjon');
      });
    });
  });
});
