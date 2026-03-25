/*
 * Production form tests for Søknad om sletting av bidragsgjeld
 * Form: nav540011
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 customConditional
 *       harDuNorskFodselsnummerEllerDNummer / borDuEtAnnetStedEnnDenAdressenDuErRegistrertMedIFolkeregisteret
 *       → borDuINorge → domestic/foreign address containers
 *   - Motpartens opplysninger (motpartensOpplysninger): 5 customConditionals
 *       harMotpartenNorskFodselsnummerEllerDNummer → motpartensFodselsdatoDdMmAaaa, borMotpartenINorge
 *       borMotpartenINorge → vetDuAdressen
 *       borMotpartenINorge / vetDuAdressen → vegadresse, utenlandskAdresse1, hvilketLandBorMotpartenI
 *   - Andre barn (andreBarn): 1 same-panel customConditional
 *       borBarnetSammenMedDeg → betalerDuBidragForBarnet → bidragPerManed
 *       + 1 cross-panel custom attachment to Vedlegg
 *   - Summary: paper happy path with minimum required answers through Vedlegg
 */

describe('nav540011', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav540011/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address follow-up when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('shows Bor du i Norge only when folkeregister address differs', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Bor du et annet sted enn den adressen du er registrert med i folkeregisteret?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');

      cy.withinComponent('Bor du et annet sted enn den adressen du er registrert med i folkeregisteret?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Motpartens opplysninger conditionals', () => {
    it('toggles the opponent address branches for domestic, foreign and unknown address paths', () => {
      cy.visit('/fyllut/nav540011/motpartensOpplysninger?sub=paper');
      cy.defaultWaits();

      cy.findByRole('textbox', { name: /Motpartens\s+fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor motparten i Norge?').should('not.exist');

      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Vet ikke' }).click();
      });

      cy.findByRole('textbox', { name: /Motpartens\s+fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor motparten i Norge?').should('exist');
      cy.findByLabelText('Vet du adressen?').should('not.exist');

      cy.withinComponent('Bor motparten i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Vet du adressen?').should('exist');

      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');

      cy.withinComponent('Bor motparten i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('combobox', { name: /Hvilket land bor motparten i/ }).should('exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('not.exist');
    });
  });

  describe('Andre barn and Vedlegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav540011/andreBarn?sub=paper');
      cy.defaultWaits();
    });

    it('shows bidrag follow-ups for other children and the matching Vedlegg attachment', () => {
      cy.findByText('Andre barn som du forsørger').should('not.exist');

      cy.withinComponent('Forsørger du egne barn, men andre enn de som søknaden gjelder?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Mia');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
      cy.findAllByRole('textbox', { name: /fødselsnummer/i })
        .first()
        .type('17912099997');
      cy.findByLabelText('Betaler du bidrag for barnet?').should('not.exist');

      cy.findAllByLabelText('Bor barnet sammen med deg?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });

      cy.findAllByLabelText('Betaler du bidrag for barnet?').first().should('exist');
      cy.findAllByLabelText('Betaler du bidrag for barnet?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });

      cy.findByLabelText('Angi bidrag per måned').should('exist');
      cy.findByRole('textbox', { name: 'Angi valuta bidraget betales i' }).should('exist');
      cy.findByLabelText('Angi bidrag per måned').type('2500');
      cy.findByRole('textbox', { name: 'Angi valuta bidraget betales i' }).type('NOK');
      cy.findAllByLabelText('Har du dokumentasjon på betalt bidrag for dette barnet?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av betalt bidrag for andre barn/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav540011/hvaGjelderSoknaden?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.findByRole('heading', { level: 2, name: 'Hva gjelder søknaden?' }).should('exist');

      // Hva gjelder søknaden?
      cy.findByRole('checkbox', { name: 'Jeg søker om sletting av bidragsgjeld' }).check({ force: true });
      cy.findByRole('checkbox', { name: 'Jeg søker om sletting av bidragsgjeld' }).should('be.checked');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Bor du et annet sted enn den adressen du er registrert med i folkeregisteret?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Motpartens opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Motpartens fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('87654321');
      cy.clickNextStep();

      // Barn som søknaden gjelder for
      cy.findAllByRole('textbox', { name: 'Barnets fornavn' }).first().type('Nora');
      cy.findAllByRole('textbox', { name: 'Barnets etternavn' }).first().type('Nordmann');
      cy.findAllByLabelText('Er barnet bosatt utenfor Norge?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
      cy.findAllByLabelText('Er det avtalt delt bosted etter barneloven § 36?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
      cy.findAllByLabelText('Forsørges barnet av andre enn foreldrene?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
      cy.findAllByLabelText('Er det avtalt/ fastsatt at den bidragspliktige skal ha samvær med barnet?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
      cy.findAllByLabelText('Har barnet inntekt?')
        .first()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
      cy.clickNextStep();

      // Din utdanning
      cy.withinComponent('Har du fullført grunnskole?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du utdanning utover grunnskole?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Din arbeidssituasjon
      cy.withinComponent('Er du i arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi grunnen til at du ikke er i arbeid' }).type(
        'Jeg er midlertidig uten arbeid.',
      );
      cy.clickNextStep();

      // Din inntekt
      cy.findAllByRole('textbox', { name: 'Valuta inntektene betales i' }).first().type('NOK');
      cy.findAllByLabelText('Personinntekt i denne valutaen').first().type('1000');
      cy.findAllByLabelText('Netto kapitalinntekt i denne valutaen').first().type('100');
      cy.clickNextStep();

      // Din formuesituasjon
      cy.withinComponent('Eier du egen bolig?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Eier du andre eiendommer i\s+Norge eller utlandet\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Eier du bil, campingvogn eller\s+andre kjøretøy\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du penger på konto/konti i Norge eller utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du aksjer, aksjefond eller verdipapirer i Norge eller utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Kan du dokumentere din formuessituasjon (for eksempel med kopi av siste års skatteoppgjør)?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      // Boforhold
      cy.withinComponent('Deler du bolig med barn over 18 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Deler du bolig med andre voksne enn egne barn?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Andre barn
      cy.withinComponent('Forsørger du egne barn, men andre enn de som søknaden gjelder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Din arbeidssituasjon', () => {
        cy.contains('dt', 'Oppgi grunnen til at du ikke er i arbeid')
          .next('dd')
          .should('contain.text', 'Jeg er midlertidig uten arbeid.');
      });
    });
  });
});
