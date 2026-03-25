/*
 * Production form tests for Søknad om stønad til tilpasningskurs
 * Form: nav100718
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 3 panel-level cross-panel conditionals
 *       hvordanOnskerDuAFylleUtSoknaden → soknadenGjelder, tilpasningskurs,
 *       begrunnelseFraFagpersoner (show=false when viaPasientjournalsystemet)
 *   - Søknaden gjelder (soknadenGjelder): 1 cross-panel trigger to opplysningerOmParorende
 *       hvordanOnskerDuAFylleUtSoknaden + hvemSkalDeltaPaTilpasningskurset.parorende
 *       → opplysningerOmParorende panel visibility
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals + 1 simple
 *       identitet.harDuFodselsnummer → adresse visibility
 *       harDuEtTelefonnummerDuKanOppgi → telefonnummer visibility
 *   - Begrunnelse fra fagperson(er) (begrunnelseFraFagpersoner): 2 same-panel + 1 cross-panel
 *       onskerDuABeskrive... = jegVilBeskriveDetIDenneSoknaden → 2 textarea fields
 *       onskerDuABeskrive... = jegLeggerVedBeskrivelseSomVedlegg → uttalelseFraFagpersonell (vedlegg)
 */

describe('nav100718', () => {
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

  describe('Veiledning – panel-level conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100718/veiledning?sub=paper');
    });

    it('hides soknadenGjelder, tilpasningskurs and begrunnelseFraFagpersoner for viaPasientjournalsystemet', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Søknaden gjelder' }).should('exist');
      cy.findByRole('link', { name: 'Tilpasningskurs' }).should('exist');
      cy.findByRole('link', { name: 'Begrunnelse fra fagperson(er)' }).should('exist');

      cy.withinComponent('Hvordan ønsker du å fylle ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Via pasientjournalsystemet' }).click();
      });

      cy.findByRole('link', { name: 'Søknaden gjelder' }).should('not.exist');
      cy.findByRole('link', { name: 'Tilpasningskurs' }).should('not.exist');
      cy.findByRole('link', { name: 'Begrunnelse fra fagperson(er)' }).should('not.exist');
    });

    it('shows soknadenGjelder, tilpasningskurs and begrunnelseFraFagpersoner for viaDetteSkjemaet', () => {
      cy.withinComponent('Hvordan ønsker du å fylle ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Via dette skjemaet' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Søknaden gjelder' }).should('exist');
      cy.findByRole('link', { name: 'Tilpasningskurs' }).should('exist');
      cy.findByRole('link', { name: 'Begrunnelse fra fagperson(er)' }).should('exist');
    });
  });

  describe('Søknaden gjelder – opplysningerOmParorende cross-panel conditional', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100718/veiledning?sub=paper');
      cy.withinComponent('Hvordan ønsker du å fylle ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Via dette skjemaet' }).click();
      });
      cy.clickNextStep(); // navigates from veiledning to soknadenGjelder
    });

    it('shows opplysningerOmParorende panel when pårørende is checked', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om pårørende' }).should('not.exist');

      cy.findByRole('group', { name: 'Hvem skal delta på tilpasningskurset?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Pårørende' }).check();
      });

      cy.findByRole('link', { name: 'Opplysninger om pårørende' }).should('exist');
    });

    it('hides opplysningerOmParorende panel when pårørende is unchecked', () => {
      cy.findByRole('group', { name: 'Hvem skal delta på tilpasningskurset?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Pårørende' }).check();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om pårørende' }).should('exist');

      cy.findByRole('group', { name: 'Hvem skal delta på tilpasningskurset?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Pårørende' }).uncheck();
      });
      cy.findByRole('link', { name: 'Opplysninger om pårørende' }).should('not.exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100718/dineOpplysninger?sub=paper');
    });

    it('shows adresse section when harDuFodselsnummer is nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section when harDuFodselsnummer is ja', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows telefonnummer when harDuEtTelefonnummerDuKanOppgi is ja', () => {
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.withinComponent('Har du et telefonnummer du kan oppgi?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Telefonnummer').should('exist');

      cy.withinComponent('Har du et telefonnummer du kan oppgi?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Telefonnummer').should('not.exist');
    });
  });

  describe('Begrunnelse fra fagperson(er) – same-panel conditionals', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100718/begrunnelseFraFagpersoner?sub=paper');
    });

    it('shows beskrivelse textareas when jegVilBeskriveDetIDenneSoknaden', () => {
      cy.findByRole('textbox', { name: 'Beskriv din grad av sansetap og funksjonsnivå' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Begrunn ditt behov for tilpasningskurs' }).should('not.exist');

      cy.withinComponent('Ønsker du å beskrive dette i søknaden, eller legge ved et vedlegg?', () => {
        cy.findByRole('radio', { name: 'Jeg vil beskrive det i denne søknaden.' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv din grad av sansetap og funksjonsnivå' }).should('exist');
      cy.findByRole('textbox', { name: 'Begrunn ditt behov for tilpasningskurs' }).should('exist');
    });

    it('hides beskrivelse textareas when jegLeggerVedBeskrivelseSomVedlegg', () => {
      cy.withinComponent('Ønsker du å beskrive dette i søknaden, eller legge ved et vedlegg?', () => {
        cy.findByRole('radio', { name: 'Jeg legger ved beskrivelse som vedlegg.' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv din grad av sansetap og funksjonsnivå' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Begrunn ditt behov for tilpasningskurs' }).should('not.exist');
    });
  });

  describe('Begrunnelse fra fagperson(er) – vedlegg cross-panel conditional', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100718/begrunnelseFraFagpersoner?sub=paper');
    });

    it('shows uttalelseFraFagpersonell attachment when jegLeggerVedBeskrivelseSomVedlegg', () => {
      cy.withinComponent('Ønsker du å beskrive dette i søknaden, eller legge ved et vedlegg?', () => {
        cy.findByRole('radio', { name: 'Jeg legger ved beskrivelse som vedlegg.' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Uttalelse fra fagpersonell').should('exist');
    });

    it('hides uttalelseFraFagpersonell attachment when jegVilBeskriveDetIDenneSoknaden', () => {
      cy.withinComponent('Ønsker du å beskrive dette i søknaden, eller legge ved et vedlegg?', () => {
        cy.findByRole('radio', { name: 'Jeg vil beskrive det i denne søknaden.' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Uttalelse fra fagpersonell').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100718/veiledning?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – choose to fill via this form
      cy.withinComponent('Hvordan ønsker du å fylle ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Via dette skjemaet' }).click();
      });
      cy.clickNextStep();

      // Søknaden gjelder – only søker (no pårørende to skip that panel)
      cy.withinComponent('Hva ønsker du å søke om?', () => {
        cy.findByRole('radio', { name: 'Tilpasningskurs for hørselshemmede.' }).click();
      });
      cy.findByRole('group', { name: 'Hvem skal delta på tilpasningskurset?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Søker' }).check();
      });
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Har du et telefonnummer du kan oppgi?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.clickNextStep();

      // Tilpasningskurs – fill required datagrid row
      cy.findByRole('textbox', { name: 'Tilpasningskursets navn' }).type('Kurs for hørselshemmede');
      cy.findByRole('textbox', { name: 'Tilpasningskursets hovedformål' }).type('Bedre mestring');
      cy.findByRole('textbox', { name: /Fra og med dato/i }).type('01.06.2025');
      cy.findByRole('textbox', { name: /Til og med dato/i }).type('07.06.2025');
      cy.findByRole('textbox', { name: 'Beskriv tilpasningskursets varighet' }).type('En uke');
      cy.clickNextStep();

      // Begrunnelse fra fagperson(er) – describe in the form
      cy.withinComponent('Ønsker du å beskrive dette i søknaden, eller legge ved et vedlegg?', () => {
        cy.findByRole('radio', { name: 'Jeg vil beskrive det i denne søknaden.' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv din grad av sansetap og funksjonsnivå' }).type('Moderat hørselstap');
      cy.findByRole('textbox', { name: 'Begrunn ditt behov for tilpasningskurs' }).type('Trenger opplæring');
      cy.clickNextStep();

      // Tilleggsopplysninger – optional, skip
      cy.clickNextStep();

      // Vedlegg – annenDokumentasjon is always visible; uttalelseFraFagpersonell is hidden because
      // we chose jegVilBeskriveDetIDenneSoknaden above
      cy.findByRole('group', { name: /Annen dokumentasjon/i }).within(() => {
        cy.findByRole('radio', { name: /ingen ekstra dokumentasjon/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva ønsker du å søke om?');
        cy.get('dd').eq(0).should('contain.text', 'Tilpasningskurs for hørselshemmede.');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
