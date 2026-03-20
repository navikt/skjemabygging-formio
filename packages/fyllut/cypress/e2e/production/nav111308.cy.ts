/*
 * Production form tests for Søknad om arbeidsavklaringspenger under etablering av egen virksomhet (utviklingsfase)
 * Form: nav111308
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse
 *       adresse.borDuINorge / adresse.vegadresseEllerPostboksadresse → adresseVarighet
 *       identitet.harDuFodselsnummer → folkeregister alert
 *   - Din utdanning (dinUtdanning): 1 same-panel conditional
 *       harDuUtdanningUtoverGrunnskole → utdanningUtoverGrunnskole datagrid
 *   - Din praksis (dinPraksis): 2 same-panel conditionals
 *       jegHarIngenTidligerePraksis → tidligereArbeid datagrid
 *       tidligereArbeid.arbeidsform → beskrivAnnenArbeidsform
 *   - Støtte og rådgivning (stotteOgRadgivning): 4 conditionals
 *       harDuSoktOmEtblererstipendFraInnovasjonNorge → angiStatusForSoknaden
 *       angiStatusForSoknaden / annen støtte → kopiAvVedtak attachment
 *       harDuSoktEllerSkalDuSokeAnnenFormForOkonomiskStotteTilEtableringen → hvilkenStotte
 *       harDuFattNoenFormForRadgivning → hvemHarDuFattRadgivningFra
 *   - Øvrige deltakere i prosjektet (ovrigeDeltakereIProsjektet): 6 same-panel conditionals
 *       erDetFlereDeltakereMedIEtableringsprosjektet → datagrid
 *       row.harDuNorskFodselsnummerEllerDNummer1 → fnr / fødselsdato + adresse branch
 *       row.borDuINorge1 → norsk / utenlandsk kontaktadresse
 *   - Om prosjektet (omProsjektet): 3 same-panel conditionals
 *       innebaererEtableringenOvertakelseKjopAvAlleredeEtablertVirksomhet → warning alert
 *       harDuForetattEnMarkedsundersokelse → planleggerDuAForetaEnMarkedsundersokelse
 *       harDuForetattEnMarkedsundersokelse + planleggerDuAForetaEnMarkedsundersokelse → begrunnHvorfor...
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 2 cross-panel attachment conditionals
 *       stotteOgRadgivning answers → kopiAvVedtak
 *       harDuForetattEnMarkedsundersokelse → kopiAvResultatAvMarkedsundersokelse
 */

const selectHasNorwegianIdentityNumber = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectApplicationStatus = (answer: RegExp) => {
  cy.withinComponent('Angi status for søknaden', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectMarketStudyDone = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Har du foretatt en markedsundersøkelse?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

describe('nav111308', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles address fields and the folkeregister alert when the identity answer changes', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      selectHasNorwegianIdentityNumber('Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      selectHasNorwegianIdentityNumber('Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');
    });

    it('shows address validity only for the foreign-address branch', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectHasNorwegianIdentityNumber('Nei');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Din utdanning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308/dinUtdanning?sub=paper');
      cy.defaultWaits();
    });

    it('shows the education datagrid only when the applicant has education beyond primary school', () => {
      cy.findByRole('textbox', { name: 'Utdanning' }).should('not.exist');

      cy.withinComponent('Har du utdanning utover grunnskole?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Utdanning' }).should('exist');
      cy.findByRole('textbox', { name: 'Utdanningssted' }).should('exist');

      cy.withinComponent('Har du utdanning utover grunnskole?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Utdanning' }).should('not.exist');
    });
  });

  describe('Din praksis conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308/dinPraksis?sub=paper');
      cy.defaultWaits();
    });

    it('hides the work-history datagrid when the applicant has no previous practice', () => {
      cy.findByLabelText('Arbeidsform').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ingen tidligere praksis/ }).click();
      cy.findByLabelText('Arbeidsform').should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ingen tidligere praksis/ }).click();
      cy.findByLabelText('Arbeidsform').should('exist');
    });

    it('shows the free-text work-form field only for the Annet option', () => {
      cy.findByRole('textbox', { name: 'Beskriv annen arbeidsform' }).should('not.exist');

      cy.withinComponent('Arbeidsform', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv annen arbeidsform' }).should('exist');

      cy.withinComponent('Arbeidsform', () => {
        cy.findByRole('radio', { name: 'Ansatt' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv annen arbeidsform' }).should('not.exist');
    });
  });

  describe('Støtte og rådgivning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308/stotteOgRadgivning?sub=paper');
      cy.defaultWaits();
    });

    it('shows the application-status and support follow-up fields for the relevant answers', () => {
      cy.findByLabelText('Angi status for søknaden').should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken støtte?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvem har du fått rådgivning fra?' }).should('not.exist');

      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Angi status for søknaden').should('exist');

      cy.withinComponent('Har du søkt eller skal du søke annen form for økonomisk støtte til etableringen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilken støtte?' }).should('exist');

      cy.withinComponent('Har du fått noen form for rådgivning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvem har du fått rådgivning fra?' }).should('exist');

      cy.withinComponent('Har du fått noen form for rådgivning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvem har du fått rådgivning fra?' }).should('not.exist');
    });
  });

  describe('Øvrige deltakere i prosjektet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308/ovrigeDeltakereIProsjektet?sub=paper');
      cy.defaultWaits();
    });

    it('shows the participant datagrid only when there are more participants', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('switches between Norwegian and foreign participant identity and address branches', () => {
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Deltakers fødselsdato (dd.mm.åååå)').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.withinComponent('Har deltaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByLabelText('Deltakers fødselsdato (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har deltaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Deltakers fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Bor deltaker i Norge?').should('exist');

      cy.withinComponent('Bor deltaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Bor deltaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt. postboks/ }).should('exist');
    });
  });

  describe('Om prosjektet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308/omProsjektet?sub=paper');
      cy.defaultWaits();
    });

    it('shows the takeover warning only when the application is about buying an existing business', () => {
      cy.contains('AAP under etablering av egen virksomhet kan bare gis ved etablering av ny virksomhet.').should(
        'not.exist',
      );

      cy.withinComponent('Innebærer etableringen overtakelse/kjøp av allerede etablert virksomhet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('AAP under etablering av egen virksomhet kan bare gis ved etablering av ny virksomhet.').should(
        'exist',
      );

      cy.withinComponent('Innebærer etableringen overtakelse/kjøp av allerede etablert virksomhet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('AAP under etablering av egen virksomhet kan bare gis ved etablering av ny virksomhet.').should(
        'not.exist',
      );
    });

    it('shows the market-study follow-ups only for the no-study branches', () => {
      cy.findByLabelText('Planlegger du å foreta en markedsundersøkelse?').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor du ikke har eller skal gjennomføre en markedsundersøkelse',
      }).should('not.exist');

      selectMarketStudyDone('Nei');
      cy.findByLabelText('Planlegger du å foreta en markedsundersøkelse?').should('exist');

      cy.withinComponent('Planlegger du å foreta en markedsundersøkelse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor du ikke har eller skal gjennomføre en markedsundersøkelse',
      }).should('not.exist');

      cy.withinComponent('Planlegger du å foreta en markedsundersøkelse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor du ikke har eller skal gjennomføre en markedsundersøkelse',
      }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the vedtak attachment when the applicant has a processed application or other support', () => {
      cy.visit('/fyllut/nav111308/stotteOgRadgivning?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      selectApplicationStatus(/Søknaden er innvilget/);

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av vedtak/ }).should('exist');
    });

    it('shows the market-study attachment only when a market study has been completed', () => {
      cy.visit('/fyllut/nav111308/omProsjektet?sub=paper');
      cy.defaultWaits();

      cy.findByRole('group', { name: /Kopi av resultat av markedsundersøkelse/ }).should('not.exist');

      selectMarketStudyDone('Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av resultat av markedsundersøkelse|Kopi av undersøkelsesresultat/ }).should(
        'exist',
      );
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111308?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Start page + Veiledning
      cy.clickNextStep();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectHasNorwegianIdentityNumber('Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din utdanning
      cy.withinComponent('Har du fullført grunnskole?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du utdanning utover grunnskole?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Din praksis
      cy.findByRole('checkbox', { name: /Jeg har ingen tidligere praksis/ }).click();
      cy.clickNextStep();

      // Støtte og rådgivning
      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du søkt eller skal du søke annen form for økonomisk støtte til etableringen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du fått noen form for rådgivning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Øvrige deltakere i prosjektet
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Om prosjektet
      cy.withinComponent('Innebærer etableringen overtakelse/kjøp av allerede etablert virksomhet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Forretningsidé' }).type('Ny forretningsidé');
      selectMarketStudyDone('Nei');
      cy.withinComponent('Planlegger du å foreta en markedsundersøkelse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvem er dine konkurrenter?' }).type('Lokale konkurrenter');
      cy.findByRole('textbox', { name: 'Beskriv hvorfor det er plass for deg i markedet' }).type(
        'Det er et tydelig behov i markedet.',
      );
      cy.findByRole('textbox', { name: 'Beskriv dine sterke sider i forhold til idéen' }).type(
        'Relevant erfaring og nettverk.',
      );
      cy.findByRole('textbox', { name: 'Beskriv dine svake sider i forhold til idéen' }).type(
        'Begrenset kapital i starten.',
      );
      cy.findByRole('textbox', { name: 'Hvordan er prosjektet tenkt finansiert?' }).type('Egenkapital og små lån.');
      cy.findByRole('textbox', { name: 'Bankforbindelse' }).type('Testbanken');
      cy.findByRole('textbox', { name: 'Hvor lang utviklingsfase beregner du å ha behov for?' }).type('6 måneder');
      cy.findByRole('textbox', { name: 'Hvordan planlegger du å bruke utviklingsfasen?' }).type(
        'Utvikle produkt og skaffe kunder.',
      );
      cy.clickNextStep();

      // Om firmaet / virksomheten
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Næringsfaglig vurdering av etableringsplaner/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Kopi av finansieringsplan/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Om prosjektet', () => {
        cy.get('dd').should('contain.text', 'Ny forretningsidé');
      });
    });
  });
});
