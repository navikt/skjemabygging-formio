import nav020807Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav020807.json';

/*
 * Production form tests for Søknad om avklaring av trygdetilhørighet under opphold i EØS eller Sveits
 * Form: nav020807
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Veiledning (veiledning): 1 same-panel conditional + 1 cross-panel trigger
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → alertstripe1
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → panel Fullmakt
 *   - Dine opplysninger (dineOpplysninger): 5 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fødselsnummer / utenlandsk identitet / borDuINorge
 *       borDuINorge → norsk/utenlandsk adresse
 *       vegadresseEllerPostboksadresse → vegadresse
 *   - Om søknaden (omSoknaden): 4 same-panel / panel-level conditionals
 *       hvaSkalDuGjoreIPeriodenDuSokerFor → hvaErSituasjonenDinIPerioden / harDuBodd...
 *       hvaErSituasjonenDinIPerioden → beskrivHvaAnnetDuSkalGjore
 *       hvaErSituasjonenDinIPerioden = jegSkalStudere → panel Studier
 *   - Oppholdet (oppholdet): 3 same-panel conditionals
 *       hvilketLandSkalDuTil2 → hvilketLandSkalDuTil / annetEosLand
 *       annetEosLand.skalDuHaNoenMidlertidigeOppholdINorgeIPerioden → omtrentHvorMangeManederPerArPlanleggerDuAVaereINorge
 *   - Studier (studier): 3 same-panel conditionals
 *       hvorSkalDuStudere + hvilketLandSkalDuTil2 → hvorforSkalDuOppholdeDegIUtlandetMensDuStuderer
 *       hvordanBetalerDuForStudiene → hvordanBetalerDuForStudiene2 / hvordanBetalerDuForStudiene3
 *   - Vedlegg (vedlegg): 1 cross-panel conditional
 *       harDuNorskFodselsnummerEllerDNummer = nei → Kopi av pass (bildeside) eller nasjonalt ID-kort
 */

const fyllerPaVegneLabel = /Fyller du ut søknaden på vegne av andre enn deg selv\?/i;
const visitPaperPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav020807/${panelKey}?sub=paper`);
  cy.get('h2#page-title').should('exist');
};
const openFormAtVeiledning = () => {
  cy.visit('/fyllut/nav020807?sub=paper');
  cy.get('h2#page-title').should('exist');
  cy.get('h2#page-title')
    .invoke('text')
    .then((title) => {
      if (title.trim() === 'Introduksjon') {
        cy.clickNextStep();
        cy.get('h2#page-title').should('exist');
      }
    });
  cy.get('h2#page-title').should('contain.text', 'Veiledning');
};
const fillVeiledningPaper = () => {
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
  cy.withinComponent(fyllerPaVegneLabel, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
};
const fillDineOpplysningerWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};
const fillOmSoknadenForStudyPath = () => {
  cy.findByRole('textbox', { name: /^Fra dato/ }).type('01.09.2025');
  cy.findByRole('textbox', { name: /^Til dato/ }).type('30.06.2026');
  cy.withinComponent('Hva skal du gjøre i perioden du søker for?', () => {
    cy.findByRole('radio', { name: 'Jeg skal ikke arbeide' }).click();
  });
  cy.withinComponent('Hva er situasjonen din i perioden?', () => {
    cy.findByRole('radio', { name: 'Jeg skal studere' }).click();
  });
  cy.withinComponent('Har du bodd eller oppholdt deg i utlandet de siste tolv månedene?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
};
const goToOppholdetPanel = () => {
  openFormAtVeiledning();
  fillVeiledningPaper();
  fillDineOpplysningerWithFnr();
  fillOmSoknadenForStudyPath();
  cy.get('h2#page-title').should('contain.text', 'Oppholdet');
};
const goToStudierPanel = () => {
  goToOppholdetPanel();
  cy.withinComponent('Hvilket land skal du til?', () => {
    cy.findByRole('radio', { name: 'Annet EØS-land' }).click();
  });
  cy.findByRole('combobox', { name: /Hvilket land skal du til/ }).type('Sver{downarrow}{enter}');
  cy.withinComponent(/Skal du ha noen midlertidige opphold i Norge i perioden\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
  cy.get('h2#page-title').should('contain.text', 'Studier');
};

describe('nav020807', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav020807*', { body: nav020807Form });
    cy.intercept('GET', '/fyllut/api/translations/nav020807*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      visitPaperPanel('veiledning');
    });

    it('shows alert and Fullmakt panel only when the application is filled on behalf of someone else', () => {
      cy.findByText(/må du sende søknaden per post/i).should('not.exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Fullmakt' }).should('not.exist');

      cy.withinComponent(fyllerPaVegneLabel, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByText(/må du sende søknaden per post/i).should('exist');
      cy.findByRole('link', { name: 'Fullmakt' }).should('exist');

      cy.findByRole('radio', { name: 'Nei' }).click();

      cy.findByText(/må du sende søknaden per post/i).should('not.exist');
      cy.findByRole('link', { name: 'Fullmakt' }).should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPaperPanel('dineOpplysninger');
    });

    it('shows foreign identity and address questions when the applicant has no Norwegian identity number', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByRole('textbox', { name: 'Fødested' }).should('exist');
      cy.findByRole('combobox', { name: 'Fødeland' }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt. postboks/ }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt. postboks/ }).should('exist');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
    });
  });

  describe('Om søknaden conditionals', () => {
    beforeEach(() => {
      visitPaperPanel('omSoknaden');
    });

    it('shows the study branch and studier panel only for the non-working study path', () => {
      cy.findByLabelText('Hva er situasjonen din i perioden?').should('not.exist');
      cy.findByLabelText('Har du bodd eller oppholdt deg i utlandet de siste tolv månedene?').should('not.exist');

      cy.withinComponent('Hva skal du gjøre i perioden du søker for?', () => {
        cy.findByRole('radio', { name: 'Jeg skal ikke arbeide' }).click();
      });

      cy.findByLabelText('Hva er situasjonen din i perioden?').should('exist');
      cy.findByLabelText('Har du bodd eller oppholdt deg i utlandet de siste tolv månedene?').should('exist');
      cy.findByRole('textbox', { name: /Beskriv hva annet du skal gjøre/ }).should('not.exist');

      cy.withinComponent('Hva er situasjonen din i perioden?', () => {
        cy.findByRole('radio', { name: 'Annen' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv hva annet du skal gjøre/ }).should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Studier' }).should('not.exist');

      cy.withinComponent('Hva er situasjonen din i perioden?', () => {
        cy.findByRole('radio', { name: 'Jeg skal studere' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv hva annet du skal gjøre/ }).should('not.exist');
      cy.findByRole('link', { name: 'Studier' }).should('exist');
    });
  });

  describe('Oppholdet conditionals', () => {
    beforeEach(() => {
      goToOppholdetPanel();
    });

    it('shows EØS-specific fields and temporary Norway stay details only when relevant', () => {
      cy.findByRole('combobox', { name: /Hvilket land skal du til/ }).should('not.exist');
      cy.findByLabelText(/Skal du ha noen midlertidige opphold i Norge i perioden\?/).should('not.exist');

      cy.withinComponent('Hvilket land skal du til?', () => {
        cy.findByRole('radio', { name: 'Annet EØS-land' }).click();
      });

      cy.findByRole('combobox', { name: /Hvilket land skal du til/ }).should('exist');
      cy.findByLabelText(/Skal du ha noen midlertidige opphold i Norge i perioden\?/).should('exist');
      cy.findByRole('textbox', { name: /Omtrent hvor mange måneder per år planlegger du å være i Norge/ }).should(
        'not.exist',
      );

      cy.withinComponent(/Skal du ha noen midlertidige opphold i Norge i perioden\?/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Omtrent hvor mange måneder per år planlegger du å være i Norge/ }).should(
        'exist',
      );

      cy.findByRole('radio', { name: 'Norge' }).click();

      cy.findByRole('combobox', { name: /Hvilket land skal du til/ }).should('not.exist');
      cy.findByLabelText(/Skal du ha noen midlertidige opphold i Norge i perioden\?/).should('not.exist');
    });
  });

  describe('Studier conditionals', () => {
    beforeEach(() => {
      goToStudierPanel();
    });

    it('shows study-specific follow-up fields for the relevant education and financing choices', () => {
      cy.findByRole('textbox', { name: /Hvorfor skal du oppholde deg i utlandet mens du studerer/ }).should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: /Hvilken privat finansiering skal du ha/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Hvordan betaler du for studieoppholdet med andre midler/ }).should('not.exist');

      cy.withinComponent('Hvor skal du studere?', () => {
        cy.findByRole('radio', { name: 'Ved et norsk lærested' }).click();
      });

      cy.findByRole('textbox', { name: /Hvorfor skal du oppholde deg i utlandet mens du studerer/ }).should('exist');

      cy.findByRole('group', { name: /Hvordan betaler du for studiene/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /Med privat finansiering/,
        }).check();
      });

      cy.findByRole('textbox', { name: /Hvilken privat finansiering skal du ha/ }).should('exist');

      cy.findByRole('group', { name: /Hvordan betaler du for studiene/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /Med privat finansiering/,
        }).uncheck();
        cy.findByRole('checkbox', { name: 'Med annet' }).check();
      });

      cy.findByRole('textbox', { name: /Hvilken privat finansiering skal du ha/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Hvordan betaler du for studieoppholdet med andre midler/ }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      visitPaperPanel('dineOpplysninger');
    });

    it('shows passport attachment on Vedlegg when the applicant has no Norwegian identity number', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av pass \(bildeside\) eller nasjonalt ID-kort/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      openFormAtVeiledning();
    });

    it('fills the study path and verifies the summary', () => {
      // Veiledning
      fillVeiledningPaper();

      // Dine opplysninger – norsk fødselsnummer path
      fillDineOpplysningerWithFnr();

      // Om søknaden – non-working study path
      fillOmSoknadenForStudyPath();

      // Oppholdet
      cy.withinComponent('Hvilket land skal du til?', () => {
        cy.findByRole('radio', { name: 'Annet EØS-land' }).click();
      });
      cy.findByRole('combobox', { name: /Hvilket land skal du til/ }).type('Sver{downarrow}{enter}');
      cy.withinComponent(/Skal du ha noen midlertidige opphold i Norge i perioden\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Studier
      cy.withinComponent('Hvor skal du studere?', () => {
        cy.findByRole('radio', { name: 'Ved et utenlandsk lærested' }).click();
      });
      cy.findByRole('textbox', { name: 'Lærestedets navn' }).type('Stockholm universitet');
      cy.findByRole('textbox', { name: 'By / stedsnavn' }).type('Stockholm');
      cy.findByRole('combobox', { name: 'Land' }).type('Sver{downarrow}{enter}');
      cy.findByRole('textbox', { name: 'Hvilken utdanning tar du?' }).type('Jus');
      cy.findByRole('textbox', { name: /Når forventer du å avslutte studiene/ }).type('06.2026');
      cy.findByRole('group', { name: /Hvordan betaler du for studiene/ }).within(() => {
        cy.findByRole('checkbox', { name: /Med støtte fra Lånekassen/ }).check();
      });
      cy.clickNextStep();

      // Familiemedlemmer
      cy.withinComponent(/Søker du for barn under 18 år som skal være med deg\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du ektefelle, partner, samboer eller barn over 18 år som sender egen søknad?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent(/Har du noen flere opplysninger til søknaden\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').contains('Fornavn');
        cy.get('dd').contains('Ola');
      });
      cy.withinSummaryGroup('Om søknaden', () => {
        cy.contains('dd', 'Jeg skal studere').should('exist');
      });
      cy.withinSummaryGroup('Oppholdet', () => {
        cy.contains('dd', 'Sverige').should('exist');
      });
      cy.withinSummaryGroup('Studier', () => {
        cy.contains('dd', 'Stockholm universitet').should('exist');
      });
    });
  });
});
