/*
 * Production form tests for Søknad om arbeidsavklaringspenger under etablering av egen virksomhet (oppstartfase)
 * Form: nav111309
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): custom conditionals on identity/address
 *       harDuFodselsnummer → info alert
 *       harDuFodselsnummer/borDuINorge → address and address validity fields
 *   - Din utdanning (dinUtdanning): 1 same-panel conditional
 *       harDuUtdanningUtoverGrunnskole → utdanningUtoverGrunnskole datagrid
 *   - Din praksis (dinPraksis): 2 same-panel conditionals
 *       jegHarIngenTidligerePraksis → tidligereArbeid datagrid
 *       arbeidsform → beskrivAnnenArbeidsform
 *   - Støtte (stotte): same-panel + cross-panel conditionals
 *       harDuSoktOmEtablererstipend → status + info alert
 *       harDuSoktEllerSkalDuSokeOmAnnenFormForOkonomiskStotteTilEtableringen → hvilkenStotteHarEllerSkalDuSokeOm
 *       stipend/status/support → kopiAvVedtak attachment on Vedlegg
 *   - Øvrige deltakere i prosjektet (ovrigeDeltakereIProsjektet): datagrid conditionals
 *       erDetFlereDeltakereMedIEtableringsprosjektet → participant datagrid
 *       harDuNorskFodselsnummerEllerDNummer1 → fnr vs fødselsdato/address fields
 *       borDuINorge1 → Norwegian vs foreign address fields
 *   - Om prosjektet (omProsjektet): 3 same-panel conditionals
 *       erVirksomhetenAlleredeStartetOpp → started date/orgnr vs expected start date
 *   - Om firmaet/virksomheten (omFirmaetVirksomheten): 3 same-panel conditionals
 *       harVirksomhetenErVegadresseEllerEnPostboksadresse → vegadresse/postboks fields
 *       hvorErVirksomhetenRegistrert1 → oppgiHvorVirksomhetenErRegistrert
 */

const ensureValue = (label: string | RegExp, value: string) => {
  cy.findByRole('textbox', { name: label }).then(($input) => {
    if (!$input.val() && !$input.is(':disabled') && !$input.attr('readonly')) {
      cy.findByRole('textbox', { name: label }).type(value);
    }
  });
};

const chooseVedleggAnswer = (groupName: RegExp, answer: RegExp | string) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const chooseOppstartUtenUtviklingsfase = () => {
  cy.withinComponent('Hva søker du om?', () => {
    cy.findByRole('radio', {
      name: 'Oppstartingsfase uten forutgående utviklingsfase (inntil tre måneder)',
    }).click();
  });
};

const formatRelativeDate = (monthsFromNow: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const visitPath = (path: string) => {
  cy.visit(path);
  cy.defaultWaits();
};

describe('nav111309', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPath('/fyllut/nav111309/dineOpplysninger?sub=paper');
    });

    it('switches between folkeregister and address fields based on identity answers', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse').should(
        'not.exist',
      );
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Vegnavn og husnummer, (evt\\.|eller) postboks/ }).should('exist');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });
  });

  describe('Din utdanning conditionals', () => {
    beforeEach(() => {
      visitPath('/fyllut/nav111309/dinUtdanning?sub=paper');
    });

    it('shows education datagrid only when the user has education beyond primary school', () => {
      cy.withinComponent('Har du utdanning utover grunnskole?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Utdanning' }).should('not.exist');

      cy.withinComponent('Har du utdanning utover grunnskole?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Utdanning' }).should('exist');
      cy.findByRole('textbox', { name: 'Utdanningssted' }).should('exist');
    });
  });

  describe('Din praksis conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111309/dinPraksis?sub=paper');
      cy.defaultWaits();
    });

    it('hides prior work rows when the user has no previous practice and shows the custom work field for Annet', () => {
      cy.findByLabelText('Arbeidsform').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ingen tidligere praksis/ }).click();
      cy.findByLabelText('Arbeidsform').should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ingen tidligere praksis/ }).click();
      cy.findByLabelText('Arbeidsform').should('exist');

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

  describe('Støtte conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111309/stotte?sub=paper');
      cy.defaultWaits();
    });

    it('toggles status, info alert and the other-support field', () => {
      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Angi status for søknaden').should('exist');

      cy.withinComponent('Angi status for søknaden', () => {
        cy.findByRole('radio', { name: 'Søknaden er ikke ferdig behandlet enda.' }).click();
      });
      cy.contains('Hvis søknaden om etablererstipend er ferdigbehandlet').should('not.exist');

      cy.withinComponent('Angi status for søknaden', () => {
        cy.findByRole('radio', { name: 'Søknaden er innvilget.' }).click();
      });
      cy.contains('Hvis søknaden om etablererstipend er ferdigbehandlet').should('exist');

      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Angi status for søknaden').should('not.exist');

      cy.findByRole('textbox', { name: 'Hvilken støtte?' }).should('not.exist');
      cy.withinComponent('Har du søkt eller skal du søke om annen form for økonomisk støtte til etableringen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilken støtte?' }).should('exist');

      cy.withinComponent('Har du søkt eller skal du søke om annen form for økonomisk støtte til etableringen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilken støtte?' }).should('not.exist');
    });

    it('shows the vedtak attachment only when the support answers require it', () => {
      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Angi status for søknaden', () => {
        cy.findByRole('radio', { name: 'Søknaden er ikke ferdig behandlet enda.' }).click();
      });
      cy.withinComponent('Har du søkt eller skal du søke om annen form for økonomisk støtte til etableringen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av vedtak/ }).should('not.exist');

      cy.findByRole('link', { name: 'Støtte' }).click();
      cy.withinComponent('Angi status for søknaden', () => {
        cy.findByRole('radio', { name: 'Søknaden er innvilget.' }).click();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av vedtak/ }).should('exist');
    });
  });

  describe('Øvrige deltakere i prosjektet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111309/ovrigeDeltakereIProsjektet?sub=paper');
      cy.defaultWaits();
    });

    it('switches between fnr and foreign-address branches inside the participant datagrid', () => {
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Har deltaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Deltakers fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor deltaker i Norge?').should('not.exist');

      cy.withinComponent('Har deltaker norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Deltakers fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor deltaker i Norge?').should('exist');

      cy.withinComponent('Bor deltaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Om prosjektet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111309/omProsjektet?sub=paper');
      cy.defaultWaits();
    });

    it('shows the correct date/orgnr fields depending on whether the business has started', () => {
      cy.withinComponent('Er virksomheten allerede startet opp?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Når startet virksomheten/ }).should('exist');
      cy.findByRole('textbox', { name: 'Oppgi virksomhetens organisasjonsnummer' }).should('exist');
      cy.findByRole('textbox', { name: /Når forventer du at virksomheten/ }).should('not.exist');

      cy.withinComponent('Er virksomheten allerede startet opp?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Når startet virksomheten/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi virksomhetens organisasjonsnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: /Når forventer du at virksomheten/ }).should('exist');
    });
  });

  describe('Om firmaet/virksomheten conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111309/omFirmaetVirksomheten?sub=paper');
      cy.defaultWaits();
    });

    it('toggles address containers and the custom registration text field', () => {
      cy.withinComponent('Har virksomheten er vegadresse eller en postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Har virksomheten er vegadresse eller en postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');

      cy.findByRole('group', { name: 'Hvor er virksomheten registrert?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).check();
      });
      cy.findByRole('textbox', { name: 'Oppgi hvor virksomheten er registrert' }).should('exist');

      cy.findByRole('group', { name: 'Hvor er virksomheten registrert?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Oppgi hvor virksomheten er registrert' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPath('/fyllut/nav111309?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      const pastDate = formatRelativeDate(-2);
      const futureDate = formatRelativeDate(2);
      const laterFutureDate = formatRelativeDate(5);

      cy.get('#page-title')
        .invoke('text')
        .then((title) => {
          const currentTitle = title.trim();

          if (currentTitle === 'Introduksjon') {
            cy.clickNextStep();
          }
        });

      cy.get('#page-title')
        .invoke('text')
        .then((title) => {
          const currentTitle = title.trim();

          if (currentTitle === 'Veiledning') {
            chooseOppstartUtenUtviklingsfase();
            cy.clickNextStep();
          }
        });

      // Dine opplysninger
      ensureValue('Fornavn', 'Ola');
      ensureValue('Etternavn', 'Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      ensureValue(/fødselsnummer/i, '17912099997');
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

      // Støtte
      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du søkt eller skal du søke om annen form for økonomisk støtte til etableringen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Øvrige deltakere i prosjektet
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Om prosjektet
      cy.findByRole('textbox', { name: 'Utviklingsfasen' }).type('Arbeider med markedsplan og leverandøravtaler.');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type(pastDate);
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type(futureDate);
      cy.withinComponent('Er virksomheten allerede startet opp?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: /Når forventer du at virksomheten \(produksjon\/tjenesteyting\) kan komme i gang/,
      }).type(laterFutureDate);
      cy.findByRole('textbox', { name: 'Hvem er dine konkurrenter?' }).type('Andre lokale konsulentselskaper.');
      cy.clickNextStep();

      // Om firmaet/virksomheten
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Nordmann Konsult');
      cy.withinComponent('Har virksomheten er vegadresse eller en postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'Etableringskommune' }).type('Oslo');
      cy.withinComponent('Hva slags selskapsform har virksomheten?', () => {
        cy.findByRole('radio', { name: 'Personlig selskap' }).click();
      });
      cy.findByRole('group', { name: 'Hvor er virksomheten registrert?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Enhetsregisteret' }).check();
      });
      cy.clickNextStep();

      // Vedlegg
      chooseVedleggAnswer(/Kopi av budsjett/, /ettersender/i);
      chooseVedleggAnswer(/Kopi av finansieringsplan/, /ettersender/i);
      chooseVedleggAnswer(/Næringsfaglig vurdering av etableringsplaner/, /ettersender/i);
      chooseVedleggAnswer(/Annen dokumentasjon|Annet/, /ingen ekstra dokumentasjon/i);
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dd', 'Ola').should('exist');
      });
      cy.withinSummaryGroup('Om firmaet/virksomheten', () => {
        cy.contains('dd', 'Nordmann Konsult').should('exist');
      });
      cy.withinSummaryGroup('Støtte', () => {
        cy.contains('dd', 'Nei').should('exist');
      });
    });
  });
});
