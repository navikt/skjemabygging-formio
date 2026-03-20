/*
 * Production form tests for Søknad om tilskudd til PC eller nettbrett
 * Form: nav100725
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om barnet (opplysningerOmBarnet): 1 same-panel conditional
 *       harElevenMottattTilskuddTilPcEllerNettbrettTidligere → alertstripe7
 *   - Hvem som fyller ut søknaden (hvemSomFyllerUtSoknaden): panel-level and same-panel conditionals
 *       hvemFyllerUtSoknaden → omDenSomFyllerUtSoknaden / begrunner / begrunnelse / utbetaling
 *       hvemFyllerUtSoknaden → skalElevensForesatteSignereSoknadenEllerLeggeVedFullmaktsskjema
 *   - Om den som fyller ut søknaden (omDenSomFyllerUtSoknaden): 2 cross-panel conditionals
 *       hvemFyllerUtSoknaden → fodselsnummerDNummer1 / skolefelter
 *   - Begrunnelse (begrunnelse): 1 same-panel + 1 cross-panel conditional
 *       jegVilHellerSkriveBegrunnelsenIEgetVedlegg → textarea / vedleggsfelt
 *   - Programvare (programvare): 3 same/cross-panel conditionals
 *       sokerDuOgsaProgramvareForLeseOgSkrivestotte → navSkjemagruppe3
 *       erValgAvLeseOgSkrivestotteprogramAvtaltMedSkolen → alertstripe10 / hvorforVelgerDuDenneProgramvaren
 *   - Vedlegg (vedlegg): 4 cross-panel conditionals
 *       hvemFyllerUtSoknaden → to skole/PPT-vedlegg
 *       harElevenMottattTilskuddTilPcEllerNettbrettTidligere → dokumentasjonAvSpesifikkeLeseOgSkrivevansker
 *       skalElevensForesatteSignereSoknadenEllerLeggeVedFullmaktsskjema → fullmakt
 *       jegVilHellerSkriveBegrunnelsenIEgetVedlegg → begrunnelse1
 */

describe('nav100725', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opplysninger om barnet – previous subsidy conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/opplysningerOmBarnet?sub=paper');
      cy.defaultWaits();
    });

    it('shows follow-up alert only when the user answers vet ikke', () => {
      cy.findByText('Nav tar kontakt med deg dersom vi ikke har den dokumentasjonen vi trenger.').should('not.exist');

      cy.withinComponent('Har eleven mottatt tilskudd til PC eller nettbrett tidligere?', () => {
        cy.findByRole('radio', { name: 'Vet ikke' }).click();
      });
      cy.findByText('Nav tar kontakt med deg dersom vi ikke har den dokumentasjonen vi trenger.').should('exist');

      cy.withinComponent('Har eleven mottatt tilskudd til PC eller nettbrett tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByText('Nav tar kontakt med deg dersom vi ikke har den dokumentasjonen vi trenger.').should('not.exist');
    });
  });

  describe('Hvem som fyller ut søknaden – panel-level and same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/hvemSomFyllerUtSoknaden?sub=paper');
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('shows parent path panel and hides fagperson-only panels for forelder', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er forelder eller foresatt til et barn under 18 år' }).click();
      });

      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');
      cy.findByRole('link', { name: 'Begrunner' }).should('not.exist');
      cy.findByRole('link', { name: 'Begrunnelse' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');
      cy.findByLabelText('Skal elevens foresatte signere søknaden eller legge ved fullmaktsskjema?').should(
        'not.exist',
      );
      cy.findByText(
        'Bekreftelse fra skolen på hvordan PC eller nettbrett skal inngå i det pedagogiske opplegget ved skolen',
      ).should('exist');
    });

    it('shows signering question and fagperson panels for fagperson', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en elev' }).click();
      });

      cy.findByLabelText('Skal elevens foresatte signere søknaden eller legge ved fullmaktsskjema?').should('exist');
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');
      cy.findByRole('link', { name: 'Begrunner' }).should('exist');
      cy.findByRole('link', { name: 'Begrunnelse' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');
      cy.findByText('Fullmaktsskjema').should('exist');
    });

    it('shows employee path panels without begrunner for skoleansatt', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er ansatt på skole og søker for en elev' }).click();
      });

      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');
      cy.findByRole('link', { name: 'Begrunner' }).should('not.exist');
      cy.findByRole('link', { name: 'Begrunnelse' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');
      cy.findByLabelText('Skal elevens foresatte signere søknaden eller legge ved fullmaktsskjema?').should('exist');
    });
  });

  describe('Om den som fyller ut søknaden – conditional fields', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/hvemSomFyllerUtSoknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows fødselsnummer for forelder path', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er forelder eller foresatt til et barn under 18 år' }).click();
      });
      cy.clickNextStep();

      cy.findByLabelText(/fødselsnummer/i).should('exist');
      cy.findByRole('textbox', { name: 'Navn på skole' }).should('not.exist');
    });

    it('shows school fields for skoleansatt path', () => {
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er ansatt på skole og søker for en elev' }).click();
      });
      cy.withinComponent('Skal elevens foresatte signere søknaden eller legge ved fullmaktsskjema?', () => {
        cy.findByRole('radio', { name: 'Elevens foresatte skal signere søknaden' }).click();
      });
      cy.clickNextStep();

      cy.findByLabelText(/fødselsnummer/i).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn på skole' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
    });
  });

  describe('Begrunnelse – own attachment toggle', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/hvemSomFyllerUtSoknaden?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en elev' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Begrunnelse' }).click();
    });

    it('hides textarea and shows vedlegg guidance when user writes the justification in an attachment', () => {
      cy.findByRole('textbox', { name: 'Begrunn behovet for PC eller nettbrett' }).should('exist');

      cy.findByRole('checkbox', { name: /Jeg vil heller skrive begrunnelsen i eget vedlegg/ }).click();

      cy.findByRole('textbox', { name: 'Begrunn behovet for PC eller nettbrett' }).should('not.exist');
      cy.contains('Skriv begrunnelsen i et eget').should('exist');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av behovet for PC eller nettbrett/ }).should('exist');
    });
  });

  describe('Programvare – conditional program choice fields', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/hvemSomFyllerUtSoknaden?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er forelder eller foresatt til et barn under 18 år' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Programvare' }).click();
    });

    it('shows program fields when ja is selected and extra explanation when school agreement is nei', () => {
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('not.exist');

      cy.withinComponent('Søker du også programvare for lese- og skrivestøtte?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Navn på programvaren' }).should('exist');
      cy.findByLabelText('Er valg av lese- og skrivestøtteprogram avtalt med skolen?').should('exist');

      cy.withinComponent('Er valg av lese- og skrivestøtteprogram avtalt med skolen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('Du bør ta kontakt med skolen').should('exist');
      cy.findByRole('textbox', { name: 'Hvorfor velger du denne programvaren?' }).should('exist');

      cy.withinComponent('Søker du også programvare for lese- og skrivestøtte?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel attachment conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/opplysningerOmBarnet?sub=paper');
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('shows parent-specific attachments and lese-skrivevedlegg when previous subsidy is nei', () => {
      cy.withinComponent('Har eleven mottatt tilskudd til PC eller nettbrett tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('link', { name: 'Hvem som fyller ut søknaden' }).click();
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er forelder eller foresatt til et barn under 18 år' }).click();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Bekreftelse fra PPT eller skolen på at utstyret skolen tilbyr ikke er tilstrekkelig/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Bekreftelse fra skolen på hvordan PC eller nettbrett skal inngå i det pedagogiske opplegget ved skolen/,
      }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av spesifikke lese- og skrivevansker/ }).should('exist');
      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad om tekniske hjelpemidler/ }).should(
        'not.exist',
      );
    });

    it('shows fullmakt attachment for fagperson when foresatte sign fullmaktsskjema', () => {
      cy.findByRole('link', { name: 'Hvem som fyller ut søknaden' }).click();
      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er fagperson som søker for en elev' }).click();
      });
      cy.withinComponent('Skal elevens foresatte signere søknaden eller legge ved fullmaktsskjema?', () => {
        cy.findByRole('radio', { name: 'Elevens foresatte skal signere fullmaktsskjema' }).click();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad om tekniske hjelpemidler/ }).should('exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea only when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du andre tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du andre tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100725?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields for forelder path and verifies summary', () => {
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Har eleven mottatt tilskudd til PC eller nettbrett tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at søkeren går i grunnskolen (1.-10. trinn)' }).click();
      cy.clickNextStep();

      cy.withinComponent('Hvem fyller ut søknaden?', () => {
        cy.findByRole('radio', { name: 'Jeg er forelder eller foresatt til et barn under 18 år' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('test@example.com');
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Programvare' }).should('exist');
      cy.withinComponent('Søker du også programvare for lese- og skrivestøtte?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Lise');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Lærer');
      cy.findByRole('textbox', { name: 'Skolens navn' }).type('Testskolen');
      cy.findByRole('textbox', { name: 'Skolens postadresse' }).type('Gate 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0123');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Stilling' }).type('Kontaktlærer');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('skole@example.com');
      cy.clickNextStep();

      cy.withinComponent('Har du andre tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Bekreftelse fra PPT eller skolen på at utstyret skolen tilbyr ikke er tilstrekkelig/,
      }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', {
        name: /Bekreftelse fra skolen på hvordan PC eller nettbrett skal inngå i det pedagogiske opplegget ved skolen/,
      }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', {
          name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
        }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om barnet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Hvem som fyller ut søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvem fyller ut søknaden?');
        cy.get('dd').eq(0).should('contain.text', 'Jeg er forelder eller foresatt til et barn under 18 år');
      });
    });
  });
});
