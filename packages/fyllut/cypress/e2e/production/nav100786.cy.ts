/*
 * Production form tests for Søknad om hjelpemiddel til kognisjon, kommunikasjon og lese- og skrivevansker
 * Form: nav100786
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem fyller ut søknaden? (hvemSomFyllerUtSoknaden): 7 same-panel / cross-panel conditionals
 *       hvemFyllerUtSoknaden → erDuOver18Ar, verge/fagperson alerts, signer branches
 *       + panel visibility for Om den som fyller ut søknaden, Opplysninger om foresatte til barnet, Levering
 *   - Dine opplysninger (dineOpplysninger): 4 same-panel customConditionals
 *       identitet.harDuFodselsnummer → adresse and folkeregister alerts
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet
 *       hvordanBorDu → institusjon alert
 *   - Hvilke hjelpemidler søker du om? (hjelpemidlerDetSokesOm): 5 same-panel conditionals
 *       programvare path → HMS / description / other helpers
 *       other helpers datagrid → quantity branch
 *   - Begrunnelse (begrunnelse): 5 same-panel conditionals
 *       prior documentation / tried-before answers → alerts and follow-up question
 *       eget vedlegg toggle → inline textareas hidden, instructions shown
 *   - Tilleggsvansker (tilleggsvansker): 3 grouped selectboxes conditionals
 *       selected difficulties → textareas
 *       no-relevant-difficulties + another option → warning alert
 *   - Levering (levering): 3 same-panel / cross-panel conditionals
 *       delivery address answer → alternate address group
 *       contact person → contact details group
 *       programvare + alternate delivery → software alert
 *   - Vedlegg (vedlegg): 3 cross-panel attachment conditionals
 *       prior documentation → fagperson attachment hidden/shown
 *       verge / fullmakt answers → representative attachments
 */

const visitWithFreshState = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav100786/${panelKey}?sub=paper`);
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectWhoFillsOutSelf = () => {
  selectRadio('Hvem fyller ut søknaden?', 'Jeg fyller ut søknaden på vegne av meg selv');
};

const selectWhoFillsOutVerge = () => {
  selectRadio('Hvem fyller ut søknaden?', 'Jeg søker for en person som jeg er verge for');
};

const selectWhoFillsOutFagperson = () => {
  selectRadio('Hvem fyller ut søknaden?', 'Jeg er fagperson som søker for innbygger');
};

const fillDineOpplysningerWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  selectRadio('Hvordan bor du?', 'Hjemme (inkluderer omsorgsbolig)');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.findByRole('textbox', { name: 'Hvilken kommune eller bydel bor du i?' }).type('Oslo');
};

const fillProgramvareOnly = () => {
  selectRadio(
    'Søker du om hjelpemidler som skal brukes spesielt i arbeidsliv eller høyere utdanning (universitets- og høyskolenivå)?',
    'Nei',
  );
  selectRadio('Søker du om programvare for lese- og skrivevansker?', 'Ja');
  cy.findByRole('textbox', { name: 'HMS-nummer for programvare for lese- og skrivevansker' }).type('123456');
  cy.findByRole('textbox', { name: 'Navn på eller beskrivelse av programvare for lese- og skrivevansker' }).type(
    'Lese- og skrivestøtte',
  );
  selectRadio('Søker du også om andre hjelpemidler?', 'Nei');
};

const startRootFlow = () => {
  visitWithFreshState('/fyllut/nav100786?sub=paper');
  cy.get('h2#page-title').then(($title) => {
    const title = $title.text().trim();
    if (title === 'Introduksjon') {
      cy.clickNextStep();
      cy.get('h2#page-title').then(($nextTitle) => {
        if ($nextTitle.text().trim() === 'Introduksjon') {
          cy.clickNextStep();
        }
      });
    }
  });
  cy.get('h2#page-title').should('contain.text', 'Veiledning');
};

const goToVedleggFromBegrunnelse = (harLevertTidligere: 'Ja' | 'Nei') => {
  visitPanel('begrunnelse');
  selectRadio('Har du tidligere levert relevant dokumentasjon fra fagpersonell?', harLevertTidligere);
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

describe('nav100786', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Hvem fyller ut søknaden? conditionals', () => {
    beforeEach(() => {
      visitPanel('hvemSomFyllerUtSoknaden');
    });

    it('toggles adult gate, guidance alerts and signer questions in paper mode', () => {
      cy.findByLabelText('Er du over 18 år?').should('not.exist');
      cy.contains('En voksen må sende søknaden for deg.').should('not.exist');
      cy.findByLabelText('Skal søkeren signere søknaden eller fullmaktsskjema?').should('not.exist');

      selectWhoFillsOutSelf();
      cy.findByLabelText('Er du over 18 år?').should('exist');

      selectRadio('Er du over 18 år?', 'Nei');
      cy.contains('En voksen må sende søknaden for deg.').should('exist');
      cy.findByLabelText('Vet du hvilket hjelpemiddel du trenger?').should('not.exist');

      selectRadio('Er du over 18 år?', 'Ja');
      cy.contains('En voksen må sende søknaden for deg.').should('not.exist');
      cy.findByLabelText('Vet du hvilket hjelpemiddel du trenger?').should('exist');

      selectWhoFillsOutVerge();
      cy.contains('kopi av verge- eller hjelpevergeattest').should('exist');
      cy.findByLabelText('Er personen du søker for over 18 år?').should('exist');

      selectWhoFillsOutFagperson();
      cy.contains('Skjema for fagpersoner').should('exist');
      cy.findByLabelText('Hvem søker du for?').should('exist');

      selectRadio('Hvem søker du for?', 'Jeg søker på vegne av person over 18 år');
      cy.contains('Når du skal søke på vegne av noen').should('exist');
      cy.findByLabelText('Skal søkeren signere søknaden eller fullmaktsskjema?').should('exist');

      selectRadio('Hvem søker du for?', 'Jeg søker på vegne av person under 18 år');
      cy.contains('Når du søker på vegne av et barn').should('exist');
      cy.findByLabelText('Skal barnets foresatte signere søknaden eller fullmaktsskjema?').should('exist');
    });

    it('updates downstream panel visibility for representative branches', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om foresatte til barnet' }).should('not.exist');
      cy.findByRole('link', { name: 'Levering' }).should('exist');

      selectWhoFillsOutFagperson();
      selectRadio('Hvem søker du for?', 'Jeg søker på vegne av person under 18 år');

      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om foresatte til barnet' }).should('exist');
      cy.findByRole('link', { name: 'Levering' }).should('not.exist');

      selectWhoFillsOutSelf();
      cy.findByRole('link', { name: 'Om den som fyller ut søknaden' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om foresatte til barnet' }).should('not.exist');
      cy.findByRole('link', { name: 'Levering' }).should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('toggles address fields and institution alert from identity and housing answers', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad').should('not.exist');
      cy.contains('Beboere på institusjon').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad').should('exist');

      selectRadio('Hvordan bor du?', 'På institusjon');
      cy.contains('Beboere på institusjon').should('exist');
    });
  });

  describe('Hvilke hjelpemidler søker du om? conditionals', () => {
    beforeEach(() => {
      visitPanel('hjelpemidlerDetSokesOm');
    });

    it('toggles programvare fields, helper datagrid and multiple-copy fields', () => {
      cy.findByRole('textbox', { name: 'HMS-nummer for programvare for lese- og skrivevansker' }).should('not.exist');
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('not.exist');

      selectRadio('Søker du om programvare for lese- og skrivevansker?', 'Ja');
      cy.findByRole('textbox', { name: 'HMS-nummer for programvare for lese- og skrivevansker' }).should('exist');
      cy.findByRole('textbox', { name: 'Navn på eller beskrivelse av programvare for lese- og skrivevansker' }).should(
        'exist',
      );
      cy.findByLabelText('Søker du også om andre hjelpemidler?').should('exist');
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('not.exist');

      selectRadio('Søker du også om andre hjelpemidler?', 'Ja');
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('exist');

      selectRadio('Har du behov for mer enn 1 eksemplar av dette hjelpemiddelet?', 'Ja');
      cy.findByLabelText('Hvor mange eksemplarer av dette hjelpemiddelet har du behov for?').should('exist');
      cy.findByRole('textbox', {
        name: 'Forklar hvorfor du har behov for mer enn 1 eksemplar av dette hjelpemiddelet',
      }).should('exist');

      selectRadio('Har du behov for mer enn 1 eksemplar av dette hjelpemiddelet?', 'Nei');
      cy.findByLabelText('Hvor mange eksemplarer av dette hjelpemiddelet har du behov for?').should('not.exist');

      selectRadio('Søker du om programvare for lese- og skrivevansker?', 'Nei');
      cy.findByRole('textbox', { name: 'HMS-nummer for programvare for lese- og skrivevansker' }).should('not.exist');
      cy.findByRole('textbox', { name: 'HMS-artikkelnummer' }).should('exist');
    });
  });

  describe('Begrunnelse conditionals', () => {
    beforeEach(() => {
      visitPanel('begrunnelse');
    });

    it('toggles documentation alerts, trial follow-up and own-attachment branch', () => {
      cy.contains('Hvis dokumentasjonen du har levert tidligere').should('not.exist');
      cy.contains('Nav trenger relevant dokumentasjon').should('not.exist');
      cy.findByLabelText('Har du allerede fått hjelpemiddelet?').should('not.exist');

      selectRadio('Har du tidligere levert relevant dokumentasjon fra fagpersonell?', 'Ja');
      cy.contains('Hvis dokumentasjonen du har levert tidligere').should('exist');

      selectRadio('Har du tidligere levert relevant dokumentasjon fra fagpersonell?', 'Nei');
      cy.contains('Nav trenger relevant dokumentasjon').should('exist');

      selectRadio('Har du prøvd ut hjelpemiddelet tidligere?', 'Ja');
      cy.findByLabelText('Har du allerede fått hjelpemiddelet?').should('exist');

      selectRadio('Har du prøvd ut hjelpemiddelet tidligere?', 'Nei');
      cy.findByLabelText('Har du allerede fått hjelpemiddelet?').should('not.exist');
      cy.contains('Hvis du ikke har prøvd hjelpemiddelet').should('exist');

      cy.findByRole('textbox', {
        name: 'Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet',
      }).should('exist');
      cy.findByRole('checkbox', { name: /Jeg vil heller skrive begrunnelsen i eget vedlegg/ }).click();
      cy.findByRole('textbox', {
        name: 'Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet',
      }).should('not.exist');
      cy.contains('Skriv begrunnelsen i et eget').should('exist');
    });
  });

  describe('Tilleggsvansker conditionals', () => {
    beforeEach(() => {
      visitPanel('tilleggsvansker');
    });

    it('toggles textarea branches and the mixed-selection warning', () => {
      cy.findByRole('textbox', { name: 'Beskriv dine vansker med tale og språk' }).should('not.exist');
      cy.contains('Du skal ikke krysse av for "Nei, jeg har ingen tilleggsvasker').should('not.exist');

      cy.findByRole('group', { name: /Har du tilleggsvansker\?/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Tale og språk' }).check();
      });
      cy.findByRole('textbox', { name: 'Beskriv dine vansker med tale og språk' }).should('exist');

      cy.findByRole('group', { name: /Har du tilleggsvansker\?/ }).within(() => {
        cy.findByRole('checkbox', {
          name: 'Nei, jeg har ingen tilleggsvansker som er relevant for denne søknaden',
        }).check();
      });
      cy.contains('Du skal ikke krysse av for "Nei, jeg har ingen tilleggsvasker').should('exist');

      cy.findByRole('group', { name: /Har du tilleggsvansker\?/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Tale og språk' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Beskriv dine vansker med tale og språk' }).should('not.exist');
    });
  });

  describe('Levering conditionals', () => {
    it('toggles alternate delivery and contact-person groups on the panel itself', () => {
      visitPanel('levering');

      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      selectRadio('Skal hjelpemidlene til din folkeregistrerte adresse?', 'Nei');
      cy.findByRole('textbox', { name: 'Navn' }).should('exist');

      selectRadio('Hvem er kontaktperson ved utlevering?', 'Annen');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');

      selectRadio('Hvem er kontaktperson ved utlevering?', 'Jeg tar imot hjelpemiddelet selv');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('shows the software-delivery alert only for programvare with alternate delivery address', () => {
      visitPanel('hjelpemidlerDetSokesOm');
      fillProgramvareOnly();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Levering' }).click();
      cy.contains('programvare for lese- og skrivevansker er et personlig hjelpemiddel').should('not.exist');

      selectRadio('Skal hjelpemidlene til din folkeregistrerte adresse?', 'Nei');
      cy.contains('programvare for lese- og skrivevansker er et personlig hjelpemiddel').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('hides or shows fagperson documentation based on previous submissions', () => {
      goToVedleggFromBegrunnelse('Ja');
      cy.findByRole('group', { name: /Uttalelse fra fagperson/ }).should('not.exist');

      goToVedleggFromBegrunnelse('Nei');
      cy.findByRole('group', { name: /Uttalelse fra fagperson/ }).should('exist');
    });

    it('shows representative attachments for verge and fullmakt branches', () => {
      visitPanel('hvemSomFyllerUtSoknaden');
      selectWhoFillsOutVerge();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('exist');

      visitPanel('hvemSomFyllerUtSoknaden');
      selectWhoFillsOutFagperson();
      selectRadio('Hvem søker du for?', 'Jeg søker på vegne av person under 18 år');
      selectRadio(
        'Skal barnets foresatte signere søknaden eller fullmaktsskjema?',
        'Barnets foresatte skal signere fullmaktsskjema',
      );
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt i forbindelse med søknad om tekniske hjelpemidler/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      startRootFlow();
    });

    it('fills required fields and verifies summary', () => {
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
      cy.clickNextStep();

      selectWhoFillsOutSelf();
      selectRadio('Er du over 18 år?', 'Ja');
      selectRadio('Vet du hvilket hjelpemiddel du trenger?', 'Ja');
      cy.clickNextStep();

      fillDineOpplysningerWithFnr();
      cy.clickNextStep();

      fillProgramvareOnly();
      cy.findByRole('checkbox', {
        name: 'Jeg er klar over at utlånte hjelpemidler er Arbeids- og velferdsetatens eiendom og at de skal tas godt vare på.',
      }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg kan ikke kreve at hjelpemidlene er ubrukte eller av et bestemt merke.',
      }).click();
      cy.findByRole('checkbox', {
        name: 'Når jeg ikke lenger har bruk for et hjelpemiddel, skal det leveres tilbake til Nav hjelpemiddelsentral eller kommunehelsetjenesten.',
      }).click();
      cy.clickNextStep();

      selectRadio('Har du tidligere levert relevant dokumentasjon fra fagpersonell?', 'Nei');
      selectRadio('Har du prøvd ut hjelpemiddelet tidligere?', 'Nei');
      cy.findByRole('textbox', {
        name: 'Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet',
      }).type('Jeg har lese- og skrivevansker.');
      cy.findByRole('textbox', {
        name: 'Beskriv hvordan hjelpemiddelet er nødvendig for å bedre funksjonsevnen din i dagliglivet',
      }).type('Programvaren gjør det mulig å lese og skrive skolearbeid.');
      cy.findByRole('textbox', {
        name: 'Beskriv hvilke andre tiltak eller hjelpemidler du har prøvd, og forklar hvorfor dette ikke er tilstrekkelig',
      }).type('Jeg har prøvd enklere støtteverktøy uten tilstrekkelig effekt.');
      cy.clickNextStep();

      cy.findByRole('group', { name: /Har du tilleggsvansker\?/ }).within(() => {
        cy.findByRole('checkbox', {
          name: 'Nei, jeg har ingen tilleggsvansker som er relevant for denne søknaden',
        }).check();
      });
      cy.clickNextStep();

      selectRadio('Skal hjelpemidlene til din folkeregistrerte adresse?', 'Ja');
      selectRadio('Hvem er kontaktperson ved utlevering?', 'Jeg tar imot hjelpemiddelet selv');
      cy.clickNextStep();

      selectRadio(
        'Har du noen som kan hjelpe deg å ta i bruk hjelpemiddelet og følge opp bruken av det?',
        'Nei, jeg klarer det selv',
      );
      cy.clickNextStep();

      cy.findByRole('group', { name: /Uttalelse fra fagperson/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Hvilke hjelpemidler søker du om?', () => {
        cy.contains('dd', 'Lese- og skrivestøtte').should('exist');
      });
      cy.withinSummaryGroup('Oppfølgings- og opplæringsansvarlig', () => {
        cy.contains('dd', /Nei, jeg klarer det selv/).should('exist');
      });
    });
  });
});
