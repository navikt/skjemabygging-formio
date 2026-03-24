/*
 * Production form tests for Søknad om synshjelpemidler
 * Form: nav100787
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 2 same-panel / panel-level conditional groups
 *       hvemFyllerUtSoknaden → paper-only alert, fagperson alert, panel visibility
 *       skalDuSokeOmBrillerEllerKontaktlinser → optiker alert
 *   - Hjelpemidler (hjelpemidler): 1 same-panel conditional group
 *       vetDuHvilketHjelpemiddelDuTrenger → datagrid or municipality alert
 *   - Dine opplysninger (dineOpplysninger): 1 same-panel conditional
 *       jegHarIkkeTelefonnummer → telefonnummer hidden
 *   - Begrunnelse (begrunnelse): 2 same-panel conditional groups
 *       harDuTidligereLevertOppdaterteSynsopplysningerFraOyelegeEllerOptiker1 → info text
 *       harDuProvdUtHjelpemiddeletTidligere1 / jegVilHellerSkriveBegrunnelsenIEgetVedlegg
 *       → alert, textarea container, attachment info text
 *   - Levering (levering): 2 same-panel conditional groups
 *       skalHjelpemidleneTilDinFolkeregistrerteAdresse → alternate address container
 *       hvemErKontaktpersonVedUtlevering → contact person group
 *   - Bolig (bolig): 1 same-panel conditional
 *       hvordanBorDuIkkeBoligskjema → institution alert
 *   - Oppfølgings- og opplæringsansvarlig (oppfolgingsOgOpplaeringsansvarlig): 2 cross-panel/custom groups
 *       hvemFyllerUtSoknaden / harDuNoenSomKanHjelpeDegATaIBrukHjelpemiddeletOgFolgeOppBrukenAvDet1
 *       → self-help branch and named contact group
 *   - Vedlegg (vedlegg): 3 cross-panel attachment conditionals
 *       hvemFyllerUtSoknaden / harDuTidligereLevertOppdaterteSynsopplysningerFraOyelegeEllerOptiker1
 *       / jegVilHellerSkriveBegrunnelsenIEgetVedlegg → conditional attachments
 */

const selectApplicantType = (option: string) => {
  cy.withinComponent('Hvem fyller ut søknaden?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const clickCheckboxByName = (name: string | RegExp) => {
  cy.contains('label', name).then(($label) => {
    const inLabel = $label.find('input[type="checkbox"]');
    const inFieldset = $label.closest('fieldset').find('input[type="checkbox"]');
    const target = (inLabel.length ? inLabel : inFieldset).first().get(0) as HTMLInputElement | undefined;
    if (target) {
      target.click();
    }
  });
};

const goToPanelFromVeiledning = (option: string, panelTitle: string) => {
  cy.visit('/fyllut/nav100787/veiledning?sub=paper');
  cy.defaultWaits();
  selectApplicantType(option);
  cy.withinComponent('Skal du søke om briller eller kontaktlinser?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const visitBegrunnelsePanel = () => {
  cy.visit('/fyllut/nav100787/begrunnelse?sub=paper');
  cy.defaultWaits();
};

describe('nav100787', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100787/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('toggles paper guidance, fagperson guidance and panel visibility from applicant type', () => {
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Hjelpemidler' }).should('exist');

      selectApplicantType('Jeg søker for eget barn under 18 år');
      cy.contains('Du må sende søknaden i posten').should('exist');
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');

      selectApplicantType('Jeg fyller ut søknaden på vegne av meg selv');
      cy.contains('Du må sende søknaden i posten').should('not.exist');
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');
      cy.findByLabelText('Skal du søke om briller eller kontaktlinser?').should('exist');

      selectApplicantType('Jeg er fagperson som søker for innbygger');
      cy.findByLabelText('Skal du søke om briller eller kontaktlinser?').should('not.exist');
      cy.contains('Du må bruke skjema for fagpersoner').should('exist');
      cy.findByRole('link', { name: 'Hjelpemidler' }).should('not.exist');
    });

    it('shows optiker guidance only when applying for glasses or contact lenses', () => {
      selectApplicantType('Jeg fyller ut søknaden på vegne av meg selv');

      cy.contains('En optiker må skrive søknaden').should('not.exist');

      cy.withinComponent('Skal du søke om briller eller kontaktlinser?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('En optiker må skrive søknaden').should('exist');

      cy.withinComponent('Skal du søke om briller eller kontaktlinser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('En optiker må skrive søknaden').should('not.exist');
    });
  });

  describe('Hjelpemidler conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100787/hjelpemidler?sub=paper');
      cy.defaultWaits();
    });

    it('shows either the datagrid or municipality guidance based on whether the aid is known', () => {
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('not.exist');
      cy.contains('kontakte hjelpemiddelformidler i kommunen').should('not.exist');

      cy.withinComponent('Vet du hvilket hjelpemiddel du trenger?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Hjelpemiddelbeskrivelse' }).should('exist');

      cy.withinComponent('Vet du hvilket hjelpemiddel du trenger?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('not.exist');
      cy.contains('kontakte hjelpemiddelformidler i kommunen').should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100787?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
      selectApplicantType('Jeg fyller ut søknaden på vegne av meg selv');
      cy.withinComponent('Skal du søke om briller eller kontaktlinser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
    });

    it('hides the telephone field when the no-phone checkbox is selected', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      clickCheckboxByName('Jeg har ikke telefonnummer');
      cy.findByLabelText('Telefonnummer').should('not.exist');

      clickCheckboxByName('Jeg har ikke telefonnummer');
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Begrunnelse conditionals', () => {
    it('shows the correct vision-information guidance for yes and no answers', () => {
      visitBegrunnelsePanel();

      cy.contains('ufullstendige eller mangelfulle').should('not.exist');
      cy.contains('NAV trenger oppdaterte synsopplysninger').should('not.exist');

      cy.withinComponent('Har du tidligere levert oppdaterte synsopplysninger fra øyelege eller optiker?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('ufullstendige eller mangelfulle').should('exist');
      cy.contains('NAV trenger oppdaterte synsopplysninger').should('not.exist');

      cy.withinComponent('Har du tidligere levert oppdaterte synsopplysninger fra øyelege eller optiker?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('ufullstendige eller mangelfulle').should('not.exist');
      cy.contains('NAV trenger oppdaterte synsopplysninger').should('exist');
    });

    it('toggles the begrunnelse textareas and attachment guidance', () => {
      visitBegrunnelsePanel();

      cy.findByRole('textbox', {
        name: 'Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet',
      }).should('exist');
      cy.contains('hvordan du kjenner til hjelpemiddelet du søker om').should('not.exist');
      cy.contains('Skriv begrunnelsen i et eget').should('not.exist');

      cy.withinComponent('Har du prøvd ut hjelpemiddelet tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('hvordan du kjenner til hjelpemiddelet du søker om').should('exist');

      clickCheckboxByName('Jeg vil heller skrive begrunnelsen i eget vedlegg.');
      cy.findByRole('textbox', {
        name: 'Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet',
      }).should('not.exist');
      cy.contains('Skriv begrunnelsen i et eget').should('exist');

      clickCheckboxByName('Jeg vil heller skrive begrunnelsen i eget vedlegg.');
      cy.findByRole('textbox', {
        name: 'Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet',
      }).should('exist');
      cy.contains('Skriv begrunnelsen i et eget').should('not.exist');
    });
  });

  describe('Levering conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100787/levering?sub=paper');
      cy.defaultWaits();
    });

    it('shows alternate address and separate contact person fields only on the matching choices', () => {
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Skal hjelpemidlene til din folkeregistrerte adresse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Kommune/bydel' }).should('exist');

      cy.withinComponent('Hvem er kontaktperson ved utlevering?', () => {
        cy.findByRole('radio', { name: 'Annen' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).should('exist');

      cy.withinComponent('Hvem er kontaktperson ved utlevering?', () => {
        cy.findByRole('radio', { name: 'Jeg tar imot hjelpemiddelet selv' }).click();
      });
      cy.findByRole('textbox', { name: /[Ee]-post/ }).should('not.exist');
    });
  });

  describe('Bolig conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100787/bolig?sub=paper');
      cy.defaultWaits();
    });

    it('shows institution guidance only for institution residents', () => {
      cy.contains('Beboere på institusjon kan bare søke NAV').should('not.exist');

      cy.withinComponent('Hvordan bor du?', () => {
        cy.findByRole('radio', { name: 'På institusjon' }).click();
      });
      cy.contains('Beboere på institusjon kan bare søke NAV').should('exist');

      cy.withinComponent('Hvordan bor du?', () => {
        cy.findByRole('radio', { name: 'Hjemme (inkluderer omsorgsbolig)' }).click();
      });
      cy.contains('Beboere på institusjon kan bare søke NAV').should('not.exist');
    });
  });

  describe('Oppfølgings- og opplæringsansvarlig conditionals', () => {
    it('shows the named contact group only when the self-filer has arranged follow-up help', () => {
      goToPanelFromVeiledning('Jeg fyller ut søknaden på vegne av meg selv', 'Oppfølgings- og opplæringsansvarlig');

      cy.findByLabelText('Har du selv oppfølgings- og opplæringsansvar?').should('not.exist');
      cy.contains('NAV vil vurdere i hvert enkelt tilfelle').should('not.exist');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('not.exist');

      cy.withinComponent(
        'Har du noen som kan hjelpe deg å ta i bruk hjelpemiddelet og følge opp bruken av det?',
        () => {
          cy.findByRole('radio', { name: 'Nei, jeg klarer det selv' }).click();
        },
      );
      cy.contains('NAV vil vurdere i hvert enkelt tilfelle').should('exist');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('not.exist');

      cy.withinComponent(
        'Har du noen som kan hjelpe deg å ta i bruk hjelpemiddelet og følge opp bruken av det?',
        () => {
          cy.findByRole('radio', { name: 'Ja, jeg har avtalt opplæring og oppfølging med en person' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('exist');
      cy.findByRole('textbox', { name: 'Treffes enklest (dag/klokken)' }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the conditional attachments for verge, missing vision information and separate justification document', () => {
      goToPanelFromVeiledning('Jeg søker for en person som jeg er verge for', 'Begrunnelse');

      cy.withinComponent('Har du tidligere levert oppdaterte synsopplysninger fra øyelege eller optiker?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du prøvd ut hjelpemiddelet tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      clickCheckboxByName('Jeg vil heller skrive begrunnelsen i eget vedlegg.');

      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Synsopplysninger fra øyelege eller optiker/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('exist');
      cy.findByRole('group', { name: /Begrunnelse/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100787?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      selectApplicantType('Jeg søker for en person som jeg er verge for');
      cy.withinComponent('Skal du søke om briller eller kontaktlinser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Hjelpemidler
      cy.withinComponent('Vet du hvilket hjelpemiddel du trenger?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).type('123456');
      cy.findByRole('textbox', { name: 'Hjelpemiddelbeskrivelse' }).type('Leselist');
      cy.clickNextStep();

      // Om den som fyller ut søknaden
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Kari');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Verge');
      cy.findByRole('textbox', { name: 'Postadresse' }).type('Testveien 1');
      cy.findAllByRole('textbox', { name: 'Postnummer' }).first().type('0123');
      cy.findAllByRole('textbox', { name: 'Poststed' }).first().type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('verge@example.com');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Ola');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Begrunnelse
      cy.withinComponent('Har du tidligere levert oppdaterte synsopplysninger fra øyelege eller optiker?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du prøvd ut hjelpemiddelet tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      clickCheckboxByName('Jeg vil heller skrive begrunnelsen i eget vedlegg.');
      cy.clickNextStep();

      // Levering
      cy.withinComponent('Skal hjelpemidlene til din folkeregistrerte adresse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Navn' }).type('Ola Nordmann');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Leveringsveien 2');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0123');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Kommune/bydel' }).type('Gamle Oslo');
      cy.withinComponent('Hvem er kontaktperson ved utlevering?', () => {
        cy.findByRole('radio', { name: 'Annen' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Fornavn' }).last().type('Per');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).last().type('Hjelper');
      cy.get('input[type="tel"]').last().type('23456789');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('kontakt@example.com');
      cy.clickNextStep();

      // Bolig
      cy.withinComponent('Hvordan bor du?', () => {
        cy.findByRole('radio', { name: 'Hjemme (inkluderer omsorgsbolig)' }).click();
      });
      cy.clickNextStep();

      // Oppfølgings- og opplæringsansvarlig
      cy.withinComponent('Har du selv oppfølgings- og opplæringsansvar?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Anne');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Veileder');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).type('NAV');
      cy.findByRole('textbox', { name: 'Stilling' }).type('Rådgiver');
      cy.findByLabelText('Telefonnummer').type('34567890');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('anne@example.com');
      cy.findByRole('textbox', { name: 'Treffes enklest (dag/klokken)' }).type('Mandag 10-14');
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', {
        name: 'Jeg er klar over at utlånte hjelpemidler er Arbeids- og velferdsetatens eiendom og at de skal tas godt vare på.',
      }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg kan ikke kreve at hjelpemidlene er ubrukte eller av et bestemt merke.',
      }).click();
      cy.findByRole('checkbox', {
        name: 'Når jeg ikke lenger har bruk for et hjelpemiddel skal det leveres tilbake til NAV Hjelpemiddelsentral via kommunehelsetjenesten.',
      }).click();

      // Vedlegg – isAttachmentPanel=true, reach via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Synsopplysninger fra øyelege eller optiker/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Begrunnelse/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ingen ekstra dokumentasjon/i }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om den som fyller ut søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Levering', () => {
        cy.get('dd').should('contain.text', 'Leveringsveien 2');
      });
    });
  });
});
