/*
 * Production form tests for Søknad om lese- og sekretærhjelp for blinde og svaksynte
 * Form: nav100730
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 5 conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (ja) / fodselsdatoDdMmAaaaSoker (nei)
 *       harDuNorskFodselsnummerEllerDNummer=nei + borDuINorge=ja → vegadresseEllerPostboksadresse
 *       vegadresseEllerPostboksadresse → vegadresse section / postboksadresse section
 *       harDuNorskFodselsnummerEllerDNummer=nei + borDuINorge=nei → utenlandsk adresse section
 *   - Behov (page5): 4 same-panel conditionals
 *       harDuBehovFor* = "ja" → antallTimer number fields
 *   - Kontaktperson(er) (page6): panel-level customConditional
 *       shown when utdanning OR arbeid OR organisasjon behov = "ja"
 *   - Vedlegg (vedlegg): 3 cross-panel conditionals (isAttachmentPanel=true)
 *       bekreftelseFraOyelegeEllerOptiker = "nei" → bekreftelse attachment
 *       utdanning behov = "ja" → utdanning dokumentasjon attachment
 *       organisasjon behov = "ja" → organisasjon dokumentasjon attachment
 */

describe('nav100730', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100730/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when harDuNorskFodselsnummerEllerDNummer is ja, hides birthdate', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText(/fødselsdato/i).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByLabelText(/fødselsdato/i).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByLabelText(/fødselsdato/i).should('exist');
    });

    it('shows address type selector when harDuNorskFodselsnummerEllerDNummer is nei and borDuINorge is ja', () => {
      cy.findByLabelText(/Er kontaktadressen din/).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText(/Er kontaktadressen din/).should('exist');
    });

    it('toggles between vegadresse and postboksadresse sections', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('shows utenlandsk adresse section when borDuINorge is nei', () => {
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Behov – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100730/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows antall timer for utdanning when behov is ja', () => {
      cy.findByLabelText('Anslå antall timer pr uke.').should('not.exist');

      cy.withinComponent(
        'Har du behov for lese- og sekretærhjelp til utdanning, opplæring eller arbeidstrening?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByLabelText('Anslå antall timer pr uke.').should('exist');

      cy.withinComponent(
        'Har du behov for lese- og sekretærhjelp til utdanning, opplæring eller arbeidstrening?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByLabelText('Anslå antall timer pr uke.').should('not.exist');
    });

    it('shows antall timer for arbeid when behov is ja', () => {
      cy.withinComponent('Har du behov for lese- og sekretærhjelp i ditt arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Anslå antall timer pr uke.').should('exist');

      cy.withinComponent('Har du behov for lese- og sekretærhjelp i ditt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Anslå antall timer pr uke.').should('not.exist');
    });

    it('shows antall timer for organisasjon when behov is ja', () => {
      cy.withinComponent(/Har du behov for lese- og sekretærhjelp for å utføre verv/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Anslå antall timer per uke.').should('exist');

      cy.withinComponent(/Har du behov for lese- og sekretærhjelp for å utføre verv/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Anslå antall timer per uke.').should('not.exist');
    });

    it('shows antall timer for dagligliv when behov is ja', () => {
      cy.withinComponent(/Har du behov for lese- og sekretærhjelp i dagliglivet/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Anslå antall timer per uke.').should('exist');

      cy.withinComponent(/Har du behov for lese- og sekretærhjelp i dagliglivet/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Anslå antall timer per uke.').should('not.exist');
    });
  });

  describe('Kontaktperson(er) – panel-level conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100730/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows Kontaktperson(er) step when utdanning behov is ja', () => {
      cy.withinComponent(
        'Har du behov for lese- og sekretærhjelp til utdanning, opplæring eller arbeidstrening?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Kontaktperson(er)' }).should('exist');
    });

    it('hides Kontaktperson(er) step when all relevant behov are nei', () => {
      cy.withinComponent(
        'Har du behov for lese- og sekretærhjelp til utdanning, opplæring eller arbeidstrening?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Har du behov for lese- og sekretærhjelp i ditt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Har du behov for lese- og sekretærhjelp for å utføre verv/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Kontaktperson(er)' }).should('not.exist');
    });
  });

  describe('Vedlegg – bekreftelse attachment conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100730/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows bekreftelse attachment when previously not sent', () => {
      cy.withinComponent(
        'Har du sendt bekreftelse fra øyelege eller optiker med diagnose og visus til hjelpemiddelsentralen tidligere?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Bekreftelse fra øyelege eller optiker med diagnose og visus/,
      }).should('exist');
    });

    it('hides bekreftelse attachment when previously sent', () => {
      cy.withinComponent(
        'Har du sendt bekreftelse fra øyelege eller optiker med diagnose og visus til hjelpemiddelsentralen tidligere?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Bekreftelse fra øyelege eller optiker med diagnose og visus/,
      }).should('not.exist');
    });
  });

  describe('Vedlegg – behov attachment conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100730/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows utdanning documentation attachment when utdanning behov is ja', () => {
      cy.withinComponent(
        'Har du behov for lese- og sekretærhjelp til utdanning, opplæring eller arbeidstrening?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Dokumentasjon av behov for lese- og sekretærhjelp til utdanning/,
      }).should('exist');
    });

    it('shows organisasjon documentation attachment when organisasjon behov is ja', () => {
      cy.withinComponent(/Har du behov for lese- og sekretærhjelp for å utføre verv/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Dokumentasjon av behov for lese- og sekretærhjelp for å utføre verv/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100730?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – required confirmation checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep(); // → Dine opplysninger

      // Dine opplysninger – fnr path, lives in Norway
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Bostedkommune' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep(); // → Bekreftelse

      // Bekreftelse – Ja (previously sent → bekreftelse attachment hidden in Vedlegg)
      cy.withinComponent(
        'Har du sendt bekreftelse fra øyelege eller optiker med diagnose og visus til hjelpemiddelsentralen tidligere?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.clickNextStep(); // → Behov

      // Behov – Nei for utdanning/arbeid/organisasjon (hides Kontaktperson panel), Ja for dagligliv
      cy.withinComponent(
        'Har du behov for lese- og sekretærhjelp til utdanning, opplæring eller arbeidstrening?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Har du behov for lese- og sekretærhjelp i ditt arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Har du behov for lese- og sekretærhjelp for å utføre verv/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Har du behov for lese- og sekretærhjelp i dagliglivet/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Anslå antall timer per uke.').type('5');
      cy.findByRole('textbox', { name: 'Beskriv konkret hva du trenger hjelp til.' }).type(
        'Trenger hjelp til lesing av post og dokumenter.',
      );
      cy.findByRole('textbox', { name: 'Beskriv hvorfor utlånte hjelpemidler ikke er tilstrekkelig.' }).type(
        'Hjelpemidler er ikke tilstrekkelig.',
      );

      // Vedlegg – isAttachmentPanel=true; use stepper to navigate
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // With bekreftelse=Ja, utdanning=Nei, organisasjon=Nei → only annenDokumentasjon shown
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });

      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Bekreftelse', () => {
        cy.get('dt').eq(0).should('contain.text', 'Har du sendt bekreftelse fra øyelege eller optiker');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
