/*
 * Production form tests for Tilleggsstønad - støtte til reise til samling
 * Form: nav111217b
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 3 same-panel customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer === "ja" → folkeregister alert
 *       adresse.borDuINorge → adresseVarighet visibility
 *   - Reiseavstand (reiseavstand): 1 same-panel customConditional
 *       velgLandReiseTilSamling → Postnummer / Postkode visibility
 *   - Reisemåte (reiseTilSamling): 7 same-panel conditionals
 *       kanDuReiseKollektivtReiseTilSamling → kollektiv / ikke-kollektiv containers
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → reason-specific fields and alerts
 *       kanDuBenytteEgenBil → own-car / no-car branches
 *       kanBenytteEgenBil extra costs → documentation alert
 *       hvaErArsakenTilAtDuIkkeKanBenytteEgenBil / kanDuBenytteDrosje → no-car follow-ups
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 5 cross-panel conditional attachments
 *       hovedårsak → medical / SFO / other-reason attachment
 *       own-car extra costs → egen bil attachment
 *       no-car reason / taxi → no-car + taxi attachments
 */

describe('nav111217b', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111217b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );
    });

    it('shows the folkeregister alert and keeps address fields hidden when the applicant has a Norwegian identity number', () => {
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows address validity fields when the applicant lives outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
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

  describe('Reiseavstand – country-specific address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111217b/reiseavstand?sub=paper');
      cy.defaultWaits();
    });

    it('shows Postnummer for Norway and Postkode for other countries', () => {
      cy.findByRole('textbox', { name: /Postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');

      cy.findByRole('combobox', { name: 'Velg land' }).type('Sver{downArrow}{enter}');

      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: /Postkode/ }).should('exist');
    });
  });

  describe('Reisemåte – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111217b/reiseTilSamling?sub=paper');
      cy.defaultWaits();
    });

    it('toggles between the kollektiv and ikke-kollektiv branches', () => {
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').should('exist');

      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('exist');
      cy.contains('Som hovedregel dekker vi den rimeligste reisemåten med kollektiv transport').should('exist');
    });

    it('shows the medical and poor-transport follow-ups for the main reason', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('not.exist');
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).should('not.exist');

      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Helsemessige årsaker' }).click();
      });
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('exist');

      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('not.exist');
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).should('exist');
    });

    it('shows the childcare and other-reason follow-ups for the main reason', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('not.exist');
      cy.findByLabelText('Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?').should('not.exist');

      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', {
          name: 'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
        }).click();
      });
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('exist');
      cy.findAllByRole('textbox', { name: 'Postnummer' }).last().should('exist');

      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('not.exist');
      cy.findByLabelText('Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?').should('exist');
    });

    it('toggles between own-car and no-car follow-ups', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });

      cy.findByRole('textbox', { name: /Bompenger/ }).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('not.exist');

      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Bompenger/ }).should('exist');

      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Bompenger/ }).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('exist');
    });

    it('shows the own-car documentation alert when extra expenses are entered', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });
      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil.').should('not.exist');

      cy.findByRole('textbox', { name: /Bompenger/ }).type('250');

      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil.').should('exist');
    });

    it('shows taxi amount for the taxi branch and the rejection message when taxi cannot be used', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });
      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er årsaken til at du ikke kan benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Disponerer ikke bil' }).click();
      });

      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByLabelText('Hvorfor kan du ikke benytte drosje?').should('not.exist');

      cy.withinComponent('Kan du benytte drosje?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('exist');

      cy.withinComponent('Kan du benytte drosje?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByLabelText('Hvorfor kan du ikke benytte drosje?').should('exist');
      cy.contains('Du vil derfor sannsynligvis få avslag på søknaden om stønad til reiser.').should('exist');
    });

    it('shows the no-car other-reason alert and textarea for the annet branch', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });
      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan benytte egen bil.').should(
        'not.exist',
      );
      cy.findByLabelText('Hvilke andre årsaker gjør at du ikke kan benytte egen bil?').should('not.exist');

      cy.withinComponent('Hva er årsaken til at du ikke kan benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });

      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan benytte egen bil.').should(
        'exist',
      );
      cy.findByLabelText('Hvilke andre årsaker gjør at du ikke kan benytte egen bil?').should('exist');
    });
  });

  describe('Vedlegg – cross-panel conditional attachments', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111217b/reiseTilSamling?sub=paper');
      cy.defaultWaits();
    });

    it('shows the medical kollektiv attachment for the health branch', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Helsemessige årsaker' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/,
      }).should('not.exist');
    });

    it('shows the childcare and other-reason kollektiv attachments for their respective branches', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', {
          name: 'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
        }).click();
      });
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).type('Barnehageveien 2');
      cy.findAllByRole('textbox', { name: 'Postnummer' }).last().type('0123');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByLabelText('Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?').type(
        'Trenger følge på hele reisen.',
      );

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt/ }).should(
        'exist',
      );
      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt/,
      }).should('not.exist');
    });

    it('shows the own-car expense attachment when extra costs are entered', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).type('Ingen kollektivtilbud i rimelig avstand.');
      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Bompenger/ }).type('300');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av utgifter knyttet til bruk av egen bil/ }).should('exist');
    });

    it('shows no-car and taxi attachments for the own-car annet plus taxi branch', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).click();
      });
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).type('Må møte før kollektivtilbudet starter.');
      cy.withinComponent('Kan du benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva er årsaken til at du ikke kan benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByLabelText('Hvilke andre årsaker gjør at du ikke kan benytte egen bil?').type('Har ikke førerkort.');
      cy.withinComponent('Kan du benytte drosje?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).type('1800');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil/ }).should(
        'exist',
      );
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til drosje/ }).should('exist');
      cy.findByRole('group', {
        name: /Legeerklæring på helsemessige årsaker til at du ikke kan benytte egen bil/,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111217b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – use Norwegian identity path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din situasjon – choose one simple option
      cy.findByRole('checkbox', { name: /Ingen av situasjonene passer/ }).check();
      cy.clickNextStep();

      // Søknadsperiode
      cy.findByLabelText('Startdato (dd.mm.åååå)').type('01.05.2026');
      cy.findByLabelText('Sluttdato (dd.mm.åååå)').type('05.05.2026');
      cy.clickNextStep();

      // Reiseavstand – Norway branch
      cy.findByLabelText('Hvor lang reisevei har du?').type('25');
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0123');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Reisemåte – kollektiv path
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').type('1500');
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.findByRole('textbox', {
        name: /Dersom du har flere opplysninger du mener er viktig for søknaden din/,
      }).type('Ingen flere opplysninger.');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg – only always-visible attachments for kollektiv path
      cy.findByRole('group', { name: /Bekreftelse for alle samlingene du skal delta på/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Reiseavstand', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvor lang reisevei har du?');
        cy.get('dd').eq(0).should('contain.text', '25');
      });
      cy.withinSummaryGroup('Reisemåte', () => {
        cy.contains('Kan du reise kollektivt?').should('exist');
        cy.contains('Ja').should('exist');
      });
    });
  });
});
