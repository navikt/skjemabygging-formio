/*
 * Production form tests for Søknad om stønad til grunnmønster og søm etter grunnmønster
 * Form: nav100755
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Søknaden gjelder (soknadenGjelder): 5 same-panel conditionals
 *       hvaSokerDuOm (selectboxes) → hvaSokerDuOm1 container (stonadTilAFaLagetGrunnmonsterForsteGang or endringAvGrunnmonster)
 *       hvaSokerDuOm1.hvorforTrengerDuGrunnmonster → hvilkenDelAvKroppen (kortvokst only)
 *       hvaSokerDuOm (selectboxes) → refusjon container (refusjonAvUtgifterTilSomAvKlaerEtterGrunnmonster)
 *       refusjon.harDuSelvLagtUt → erDetMerEnn6Måneder (ja) / skalLeverandorenSendeFaktura (nei)
 *       refusjon.erDetMerEnn6Måneder → oppgiArsaken (ja)
 *       + 1 cross-panel trigger to Erklæring (erDetMerEnn6Måneder=ja → refusjonsfrist-checkbox)
 *   - Personinformasjon (personopplysninger): 1 customConditional
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Vedlegg (vedlegg): 2 cross-panel conditional attachments from hvaSokerDuOm
 *       erklaeringFraLegeFysioterapeutEllerErgoterapeutOmArsakenTilAtDuHarBehovForSpesialsyddeKlaer
 *       erklaeringFraLegeFysioterapeutEllerErgoterapeutOmAtKroppenHarEndretSegSlikAtDetErBehovForEtNyttGrunnmonster
 */

describe('nav100755', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Søknaden gjelder – hvaSokerDuOm container conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100755/soknadenGjelder?sub=paper');
      cy.defaultWaits();
    });

    it('shows grunnmønster container when stonadTilAFaLagetGrunnmonsterForsteGang is checked', () => {
      cy.findByLabelText('Hvorfor trenger du grunnmønster?').should('not.exist');

      cy.findByRole('checkbox', { name: 'Stønad til å få laget grunnmønster første gang' }).click();

      cy.findByLabelText('Hvorfor trenger du grunnmønster?').should('exist');

      cy.findByRole('checkbox', { name: 'Stønad til å få laget grunnmønster første gang' }).click();

      cy.findByLabelText('Hvorfor trenger du grunnmønster?').should('not.exist');
    });

    it('shows grunnmønster container when endringAvGrunnmonster is checked', () => {
      cy.findByLabelText('Hvorfor trenger du grunnmønster?').should('not.exist');

      cy.findByRole('checkbox', {
        name: 'Endring av grunnmønster fordi din kroppsfasong har forandret seg vesentlig',
      }).click();

      cy.findByLabelText('Hvorfor trenger du grunnmønster?').should('exist');
    });

    it('shows hvilkenDelAvKroppen only when kortvokst is selected', () => {
      cy.findByRole('checkbox', { name: 'Stønad til å få laget grunnmønster første gang' }).click();

      cy.findByRole('checkbox', { name: 'Jeg trenger spesialsydde klær til overkroppen' }).should('not.exist');

      cy.withinComponent('Hvorfor trenger du grunnmønster?', () => {
        cy.findByRole('radio', { name: 'Jeg er kortvokst og trenger spesialsydde klær' }).click();
      });

      cy.findByRole('checkbox', { name: 'Jeg trenger spesialsydde klær til overkroppen' }).should('exist');

      cy.withinComponent('Hvorfor trenger du grunnmønster?', () => {
        cy.findByRole('radio', { name: 'Kroppen min har ulik høyre og venstre side' }).click();
      });

      cy.findByRole('checkbox', { name: 'Jeg trenger spesialsydde klær til overkroppen' }).should('not.exist');
    });

    it('shows refusjon fields when refusjonAvUtgifterTilSomAvKlaerEtterGrunnmonster is checked', () => {
      cy.findByLabelText(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
      ).should('not.exist');

      cy.findByRole('checkbox', { name: 'Refusjon av utgifter til søm av klær etter grunnmønster' }).click();

      cy.findByLabelText(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
      ).should('exist');

      cy.findByRole('checkbox', { name: 'Refusjon av utgifter til søm av klær etter grunnmønster' }).click();

      cy.findByLabelText(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
      ).should('not.exist');
    });
  });

  describe('Søknaden gjelder – refusjon conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100755/soknadenGjelder?sub=paper');
      cy.defaultWaits();
      cy.findByRole('checkbox', { name: 'Refusjon av utgifter til søm av klær etter grunnmønster' }).click();
    });

    it('shows erDetMerEnn6Måneder when harDuSelvLagtUt is ja', () => {
      cy.findByLabelText('Er det mer enn 6 måneder siden du hadde utlegget?').should('not.exist');

      cy.withinComponent(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText('Er det mer enn 6 måneder siden du hadde utlegget?').should('exist');
    });

    it('shows skalLeverandorenSendeFaktura when harDuSelvLagtUt is nei', () => {
      cy.findByLabelText('Skal leverandøren sende faktura for utgifter til Nav?').should('not.exist');

      cy.withinComponent(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText('Skal leverandøren sende faktura for utgifter til Nav?').should('exist');
    });

    it('shows oppgiArsaken when erDetMerEnn6Måneder is ja', () => {
      cy.withinComponent(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Oppgi årsaken til at du ber om unntak fra foreldelsesfristen' }).should(
        'not.exist',
      );

      cy.withinComponent('Er det mer enn 6 måneder siden du hadde utlegget?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Oppgi årsaken til at du ber om unntak fra foreldelsesfristen' }).should(
        'exist',
      );
    });

    it('shows refusjonsfrist-erklæring on Erklæring panel when erDetMerEnn6Måneder is ja', () => {
      cy.withinComponent(
        'Har du selv lagt ut for utgifter til søm av klær etter grunnmønster og søker refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Er det mer enn 6 måneder siden du hadde utlegget?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Erklæring' }).click();

      cy.findByRole('checkbox', { name: /fristen for å søke refusjon/ }).should('exist');
    });
  });

  describe('Personinformasjon – identity conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100755/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when harDuFodselsnummer is nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps adresse section hidden when harDuFodselsnummer is ja', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachments', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100755/soknadenGjelder?sub=paper');
      cy.defaultWaits();
    });

    it('shows erklæring om årsaken for stonadTilAFaLagetGrunnmonsterForsteGang', () => {
      cy.findByRole('checkbox', { name: 'Stønad til å få laget grunnmønster første gang' }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om årsaken/ }).should(
        'exist',
      );
      cy.findByRole('group', {
        name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om at kroppen har endret seg/,
      }).should('not.exist');
    });

    it('shows erklæring om kroppen for endringAvGrunnmonster', () => {
      cy.findByRole('checkbox', {
        name: 'Endring av grunnmønster fordi din kroppsfasong har forandret seg vesentlig',
      }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om at kroppen har endret seg/,
      }).should('exist');
      cy.findByRole('group', { name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om årsaken/ }).should(
        'not.exist',
      );
    });

    it('hides both conditional erklæring attachments when neither option is checked', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om årsaken/ }).should(
        'not.exist',
      );
      cy.findByRole('group', {
        name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om at kroppen har endret seg/,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100755?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – confirm checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      // Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Søknaden gjelder – stonadTilAFaLagetGrunnmonsterForsteGang path
      cy.findByRole('checkbox', { name: 'Stønad til å få laget grunnmønster første gang' }).click();
      cy.withinComponent('Hvorfor trenger du grunnmønster?', () => {
        cy.findByRole('radio', { name: 'Jeg er kortvokst og trenger spesialsydde klær' }).click();
      });
      cy.findByRole('checkbox', { name: 'Jeg trenger spesialsydde klær til overkroppen' }).click();
      cy.findByRole('textbox', { name: 'Beskriv hvorfor du ikke kan kjøpe klær i vanlige butikker' }).type(
        'Trenger spesialsydde klær på grunn av kortvoksthet.',
      );
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', {
        name: 'Jeg har gjort meg kjent med vilkårene for å motta stønad til grunnmønster.',
      }).check();
      cy.findByRole('checkbox', {
        name: 'Jeg er kjent med at Nav kan innhente opplysninger som er nødvendige for å behandle søknaden.',
      }).check();
      cy.clickNextStep();

      // Vedlegg (isAttachmentPanel: true) – erklæring om årsaken visible for stonadTilAFaLagetGrunnmonsterForsteGang
      cy.findByRole('group', { name: /Erklæring fra lege, fysioterapeut eller ergoterapeut om årsaken/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva søker du om?');
        cy.get('dd').eq(0).should('contain.text', 'Stønad til å få laget grunnmønster første gang');
      });
      cy.withinSummaryGroup('Personinformasjon', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
