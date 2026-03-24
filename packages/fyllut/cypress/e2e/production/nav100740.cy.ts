/*
 * Production form tests for Søknad om stønad til bil og spesialutstyr
 * Form: nav100740
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 2 same-panel conditionals
 *       hvemFyllerUtSoknaden → alertstripe / alertstripe1
 *   - Søknaden gjelder (soknadenGjelder): same-panel + panel-level conditionals
 *       hvaSkalDuSokeOm → branch-specific questions and panel visibility
 *       sokerDuOmKjoretekniskUtstyr / hvemSkalKjoreBilen / harDuForerkortSomErGyldigINorge
 *       hvorforSokerDuOmSpesialtilpassetKassebil → harDuTvangsvedtakIBil
 *   - Dine opplysninger (personopplysninger): 4 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse / alertstripe
 *       adresse.borDuINorge → adresseVarighet
 *       erDuUnder18Ar + harDuVerge → foreldrefelt
 *       harDuVerge → vergefelt
 *   - Utstyr til bilen (utstyrTilBilen): 1 same-panel conditional
 *       harDuITilleggBehovForATaMedDegHjelpemidlerIBilen → hvaSlagsHjelpemidlerMaDuHaMedDegIBilen1
 *   - Bilen (bilen): 3 same-panel conditionals
 *       eierDuBilenSomSkalTilpassesEllerSkalDuKjopeDegEnNy → alertstripe19 / navSkjemagruppe4 / navSkjemagruppe5
 *   - Fastlege (fastlege): 2 same-panel conditionals
 *       harDuFastlege → navSkjemagruppe1 / navSkjemagruppe2
 *   - Vedlegg (vedlegg): cross-panel conditionals from Søknaden gjelder and Bilen
 *       sokerDuOmKjoretekniskUtstyr, harDuForerkortSomErGyldigINorge,
 *       eierDuBilenSomSkalTilpassesEllerSkalDuKjopeDegEnNy
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
  visitWithFreshState(`/fyllut/nav100740/${panelKey}?sub=paper`);
};

const visitRoot = () => {
  visitWithFreshState('/fyllut/nav100740?sub=paper');
};

const selectRadioOption = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label as string, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectCheckboxOption = (groupLabel: string | RegExp, optionLabel: string | RegExp) => {
  cy.findByRole('group', { name: groupLabel }).within(() => {
    cy.findByRole('checkbox', { name: optionLabel }).check();
  });
};

const advancePastIntroduksjonIfPresent = () => {
  cy.get('h2#page-title', { timeout: 10000 }).then(($title) => {
    if ($title.text().trim() === 'Introduksjon') {
      cy.clickNextStep();

      cy.get('h2#page-title', { timeout: 10000 }).then(($nextTitle) => {
        if ($nextTitle.text().trim() === 'Introduksjon') {
          cy.clickNextStep();
        }
      });
    }
  });

  cy.get('h2#page-title', { timeout: 10000 }).should(($title) => {
    if ($title.text().trim() === 'Introduksjon') {
      throw new Error('Still on Introduksjon');
    }
  });

  cy.findByLabelText('Hvem fyller ut søknaden?').should('exist');
};

const fillVeiledningForSelf = () => {
  advancePastIntroduksjonIfPresent();
  selectRadioOption('Hvem fyller ut søknaden?', 'Jeg fyller ut søknaden på vegne av meg selv');
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
};

const goToSpesialutstyrPanel = (panelTitle: string) => {
  visitPanel('veiledning');
  fillVeiledningForSelf();
  cy.clickNextStep();

  selectRadioOption('Hva skal du søke om?', 'Stønad til spesialutstyr eller tilpasning av bil');
  selectRadioOption('Søker du om kjøreteknisk utstyr?', 'Ja');

  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const chooseEttersender = (groupName: RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

describe('nav100740', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      visitPanel('veiledning');
    });

    it('shows postal submission guidance only when applying for child or person under guardianship', () => {
      cy.findByText('Du må sende søknaden i posten').should('not.exist');

      selectRadioOption('Hvem fyller ut søknaden?', 'Jeg søker for eget barn under 18 år');
      cy.findByText('Du må sende søknaden i posten').should('exist');

      selectRadioOption('Hvem fyller ut søknaden?', 'Jeg fyller ut søknaden på vegne av meg selv');
      cy.findByText('Du må sende søknaden i posten').should('not.exist');

      selectRadioOption('Hvem fyller ut søknaden?', 'Jeg søker for en person som jeg er verge for');
      cy.findByText('Du må sende søknaden i posten').should('exist');
    });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      visitPanel('soknadenGjelder');
    });

    it('toggles branch-specific questions when application type changes', () => {
      cy.findByLabelText('Har du behov for spesialtilpasning?').should('not.exist');
      cy.findByLabelText('Søker du om kjøreteknisk utstyr?').should('not.exist');
      cy.findByLabelText('Hva skal du bruke bilen til?').should('not.exist');
      cy.findByLabelText('Hvorfor søker du om spesialtilpasset kassebil?').should('not.exist');

      selectRadioOption(
        'Hva skal du søke om?',
        'Tilskudd til kjøp av bil til bruk til og fra arbeid eller høyere utdanning',
      );
      cy.findByLabelText('Har du behov for spesialtilpasning?').should('exist');
      cy.findByLabelText('Hva skal du bruke bilen til?').should('not.exist');
      cy.findByLabelText('Søker du om kjøreteknisk utstyr?').should('not.exist');

      selectRadioOption('Har du behov for spesialtilpasning?', 'Ja');
      cy.findByLabelText('Hvem skal kjøre bilen?').should('exist');

      selectRadioOption('Hvem skal kjøre bilen?', 'Jeg skal kjøre selv');
      cy.findByLabelText('Har du førerkort som er gyldig i Norge?').should('exist');

      selectRadioOption('Har du førerkort som er gyldig i Norge?', 'Nei');
      cy.findByLabelText('Holder du på å ta eller skal du begynne å ta førerkort?').should('exist');

      selectRadioOption('Holder du på å ta eller skal du begynne å ta førerkort?', 'Ja');
      cy.findByLabelText('Søker du om stønad til kjøreopplæring?').should('exist');

      selectRadioOption('Hva skal du søke om?', 'Stønad til spesialutstyr eller tilpasning av bil');
      cy.findByLabelText('Har du behov for spesialtilpasning?').should('not.exist');
      cy.findByLabelText('Søker du om kjøreteknisk utstyr?').should('exist');
      cy.findByLabelText('Hva skal du bruke bilen til?').should('exist');
      cy.findByLabelText('Søker du om stønad til kjøreopplæring?').should('not.exist');

      selectRadioOption('Søker du om kjøreteknisk utstyr?', 'Nei');
      cy.findByLabelText('Hvem skal kjøre bilen?').should('exist');

      selectRadioOption('Søker du om kjøreteknisk utstyr?', 'Ja');
      cy.findByLabelText('Hvem skal kjøre bilen?').should('not.exist');
      cy.findByLabelText('Har du førerkort som er gyldig i Norge?').should('exist');

      selectRadioOption('Hva skal du søke om?', 'Stønad til spesialtilpasset kassebil');
      cy.findByLabelText('Hva skal du bruke bilen til?').should('exist');
      cy.findByLabelText('Hvorfor søker du om spesialtilpasset kassebil?').should('exist');

      selectCheckboxOption('Hvorfor søker du om spesialtilpasset kassebil?', 'På grunn av utagerende adferd i bil');
      cy.findByLabelText('Har du tvangsvedtak i bil?').should('exist');
    });

    it('switches wizard panels between vehicle-support branches', () => {
      visitPanel('veiledning');
      fillVeiledningForSelf();
      cy.clickNextStep();

      selectRadioOption('Hva skal du søke om?', 'Stønad til spesialutstyr eller tilpasning av bil');
      selectRadioOption('Søker du om kjøreteknisk utstyr?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utstyr til bilen' }).should('exist');
      cy.findByRole('link', { name: 'Bilen' }).should('exist');
      cy.findByRole('link', { name: 'Inntekt' }).should('not.exist');
      cy.findByRole('link', { name: 'Behov for bil' }).should('not.exist');
      cy.findByRole('link', { name: 'Bil og utstyr' }).should('not.exist');
      cy.findByRole('link', { name: 'Eier du bil?' }).should('not.exist');

      selectRadioOption('Hva skal du søke om?', 'Stønad til spesialtilpasset kassebil');
      cy.findByRole('link', { name: 'Utstyr til bilen' }).should('not.exist');
      cy.findByRole('link', { name: 'Bilen' }).should('not.exist');
      cy.findByRole('link', { name: 'Inntekt' }).should('exist');
      cy.findByRole('link', { name: 'Behov for bil' }).should('exist');
      cy.findByRole('link', { name: 'Bil og utstyr' }).should('exist');
      cy.findByRole('link', { name: 'Eier du bil?' }).should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('personopplysninger');
    });

    it('shows address and guardian branches only when triggered', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn på forelder 1' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn på verge' }).should('not.exist');

      selectRadioOption('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadioOption('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      selectRadioOption('Er du under 18 år?', 'Ja');
      selectRadioOption('Har du verge?', 'Nei');
      cy.findByRole('textbox', { name: 'Navn på forelder 1' }).should('exist');

      selectRadioOption('Har du verge?', 'Ja');
      cy.findByRole('textbox', { name: 'Navn på forelder 1' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn på verge' }).should('exist');
      cy.findByRole('textbox', { name: 'Telefonnummer til verge' }).should('exist');
    });
  });

  describe('Utstyr til bilen conditionals', () => {
    beforeEach(() => {
      goToSpesialutstyrPanel('Utstyr til bilen');
    });

    it('shows helper-equipment details only when needed in the vehicle', () => {
      cy.findByRole('textbox', { name: 'Hva slags hjelpemidler må du ha med deg i bilen?' }).should('not.exist');

      selectRadioOption('Har du i tillegg behov for å ta med deg hjelpemidler i bilen?', 'Ja');
      cy.findByRole('textbox', { name: 'Hva slags hjelpemidler må du ha med deg i bilen?' }).should('exist');

      selectRadioOption('Har du i tillegg behov for å ta med deg hjelpemidler i bilen?', 'Nei');
      cy.findByRole('textbox', { name: 'Hva slags hjelpemidler må du ha med deg i bilen?' }).should('not.exist');
    });
  });

  describe('Bilen conditionals', () => {
    beforeEach(() => {
      goToSpesialutstyrPanel('Bilen');
    });

    it('switches between existing-car and new-car details', () => {
      cy.findByRole('textbox', { name: 'Registreringsnummer' }).should('exist');
      cy.findAllByRole('textbox', { name: 'Bilmerke' }).should('have.length.at.least', 1);

      selectRadioOption('Eier du bilen som skal tilpasses, eller skal du kjøpe deg en ny?', 'Jeg skal kjøpe ny bil');
      cy.findByRole('textbox', { name: 'Registreringsnummer' }).should('not.exist');
      cy.findAllByRole('textbox', { name: 'Bilmerke' }).should('have.length', 1);

      selectRadioOption('Eier du bilen som skal tilpasses, eller skal du kjøpe deg en ny?', 'Nei, jeg eier ikke bilen');
      cy.contains('Vi trenger bekreftelse fra bileier om at utstyret kan monteres i bilen.').should('exist');
      cy.findByRole('textbox', { name: 'Registreringsnummer' }).should('exist');
    });
  });

  describe('Fastlege conditionals', () => {
    beforeEach(() => {
      visitPanel('fastlege');
    });

    it('switches between fastlege details and other practitioner details', () => {
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('not.exist');

      selectRadioOption('Har du fastlege?', 'Ja');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      selectRadioOption('Har du fastlege?', 'Nei');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('exist');
      cy.findByRole('textbox', { name: 'Stilling til behandleren din' }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      visitPanel('veiledning');
      fillVeiledningForSelf();
      cy.clickNextStep();

      selectRadioOption('Hva skal du søke om?', 'Stønad til spesialutstyr eller tilpasning av bil');
      selectRadioOption('Søker du om kjøreteknisk utstyr?', 'Ja');
      selectRadioOption('Har du førerkort som er gyldig i Norge?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Bilen' }).click();
      selectRadioOption('Eier du bilen som skal tilpasses, eller skal du kjøpe deg en ny?', 'Nei, jeg eier ikke bilen');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
    });

    it('shows attachment groups driven by earlier answers', () => {
      cy.findByRole('group', { name: /Legeerklæring for motorkjøretøy/ }).should('exist');
      cy.findByRole('group', {
        name: /Erklæring fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy/,
      }).should('exist');
      cy.findByRole('group', { name: /Kopi av førerkortet ditt/ }).should('exist');
      cy.findByRole('group', { name: /Bekreftelse fra bileier om at utstyret kan monteres i bilen/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av tvangsvedtak som gjelder bil/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitRoot();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      fillVeiledningForSelf();
      cy.clickNextStep();

      // Søknaden gjelder
      selectRadioOption('Hva skal du søke om?', 'Stønad til spesialutstyr eller tilpasning av bil');
      selectRadioOption('Hva skal du bruke bilen til?', 'Bruk i dagliglivet');
      selectRadioOption('Søker du om kjøreteknisk utstyr?', 'Ja');
      selectRadioOption('Har du førerkort som er gyldig i Norge?', 'Ja');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadioOption('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      selectRadioOption('Er du under 18 år?', 'Nei');
      selectRadioOption('Har du verge?', 'Nei');
      cy.clickNextStep();

      // Utstyr til bilen
      cy.findByRole('textbox', {
        name: /Beskriv hva slags spesialutstyr og \/ eller tilpasninger du har behov for/,
      }).type('Håndstyrt gass og brems.');
      cy.findByRole('textbox', {
        name: /Oppgi diagnose\. Beskriv din funksjonsevne, forklar hvorfor spesialutstyret/,
      }).type('Har behov for tilpasning for å kunne kjøre sikkert.');
      selectRadioOption('Har du i tillegg behov for å ta med deg hjelpemidler i bilen?', 'Nei');
      cy.clickNextStep();

      // Bilen
      selectRadioOption('Eier du bilen som skal tilpasses, eller skal du kjøpe deg en ny?', 'Nei, jeg eier ikke bilen');
      cy.findByRole('textbox', { name: 'Registreringsnummer' }).type('AB12345');
      cy.findByRole('textbox', { name: 'Bilmerke' }).type('Volkswagen');
      cy.findByRole('textbox', { name: 'Bilmodell' }).type('Transporter');
      cy.findByLabelText('Årsmodell').type('2020');
      cy.clickNextStep();

      // Fastlege
      selectRadioOption('Har du fastlege?', 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Lege');
      cy.get('input[type="tel"]').first().type('12345678');
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.clickNextStep();

      // Vedlegg
      chooseEttersender(/Legeerklæring for motorkjøretøy/);
      chooseEttersender(/Erklæring fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy/);
      chooseEttersender(/Bekreftelse fra bileier om at utstyret kan monteres i bilen/);
      chooseEttersender(/Kopi av førerkortet ditt/);
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Jeg ettersender dokumentasjonen senere|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dd', 'Stønad til spesialutstyr eller tilpasning av bil').should('exist');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dd', 'Ola').should('exist');
      });
      cy.withinSummaryGroup('Utstyr til bilen', () => {
        cy.contains('dd', 'Håndstyrt gass og brems.').should('exist');
      });
      cy.withinSummaryGroup('Bilen', () => {
        cy.contains('dd', 'AB12345').should('exist');
      });
    });
  });
});
