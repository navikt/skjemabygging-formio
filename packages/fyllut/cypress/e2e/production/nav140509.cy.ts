/*
 * Production form tests for Søknad om foreldrepenger ved fødsel
 * Form: nav140509
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Barnet (barnet): 4 same-panel conditionals
 *       erBarnetFodt → barnetErFodt / barnetErIkkeFodt
 *       hvorMangeBarnFikkDu → single-child vs multiple-children fields
 *       bleBarnetFodtINorge / bleBarnaFodtINorge → folkeregister questions
 *   - Den andre forelderen (denAndreForelderen): 4 same-panel conditionals
 *       kanDuGiOssNavnetPaDenAndreForelderen → name/identity group
 *       harDenAndreForelderenNorskFodselsnummerEllerDNummer → fnr or foreign-id fields
 *       erDuAleneOmOmsorgenAvBarnet → rights follow-up visibility
 *   - Opphold i utland (oppholdIUtland): 2 same-panel conditionals
 *       hvorSkalDuBoDeNeste12Manedene → future-stays datagrid
 *       hvorHarDuBoddDeSiste12Manedene → past-stays datagrid
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from arbeidsforholdOgInntekt
 *       harDuArbeidsforholdINorge → bekreftelsePaTermindatoFraLegeEllerJordmor
 */

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

const fillApplicantIdentity = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

describe('nav140509', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Barnet – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140509/barnet?sub=paper');
      cy.defaultWaits();
    });

    it('switches between single-child and multiple-children fields when antall barn changes', () => {
      cy.findByRole('textbox', { name: /Når ble barnet født/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Når ble det eldste barnet født/ }).should('not.exist');

      cy.withinComponent(/Er barnet født\?/i, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hvor mange barn fikk du?').type('1');
      cy.findByRole('textbox', { name: /Når ble barnet født/ }).should('exist');
      cy.findByLabelText('Ble barnet født i Norge?').should('exist');
      cy.findByRole('textbox', { name: /Når ble det eldste barnet født/ }).should('not.exist');
      cy.findByLabelText('Ble barna født i Norge?').should('not.exist');

      cy.findByLabelText('Hvor mange barn fikk du?').clear();
      cy.findByLabelText('Hvor mange barn fikk du?').type('2');
      cy.findByRole('textbox', { name: /Når ble barnet født/ }).should('not.exist');
      cy.findByLabelText('Ble barnet født i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Når ble det eldste barnet født/ }).should('exist');
      cy.findByLabelText('Ble barna født i Norge?').should('exist');
    });

    it('shows folkeregister follow-up only when barnet/barna ikke ble født i Norge', () => {
      cy.withinComponent(/Er barnet født\?/i, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hvor mange barn fikk du?').type('1');
      cy.findByLabelText('Er barnet registrert i det norske folkeregisteret?').should('not.exist');

      cy.withinComponent('Ble barnet født i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er barnet registrert i det norske folkeregisteret?').should('exist');

      cy.withinComponent('Ble barnet født i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er barnet registrert i det norske folkeregisteret?').should('not.exist');

      cy.findByLabelText('Hvor mange barn fikk du?').clear();
      cy.findByLabelText('Hvor mange barn fikk du?').type('2');
      cy.findByLabelText('Er barna registrert i det norske folkeregisteret?').should('not.exist');

      cy.withinComponent('Ble barna født i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er barna registrert i det norske folkeregisteret?').should('exist');
    });
  });

  describe('Den andre forelderen – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140509/denAndreForelderen?sub=paper');
      cy.defaultWaits();
    });

    it('toggles identity fields based on whether you can provide the other parent and Norwegian id', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.exist');

      cy.withinComponent('Kan du gi oss navnet på den andre forelderen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByLabelText(/Hva er den andre forelderens fødselsnummer eller d-nummer/i).should('not.exist');
      cy.findByRole('textbox', { name: /utenlandske fødselsnummer/i }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvor bor den andre forelderen?' }).should('not.exist');

      cy.withinComponent('Har den andre forelderen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Hva er den andre forelderens fødselsnummer eller d-nummer/i).should('exist');
      cy.findByRole('textbox', { name: /utenlandske fødselsnummer/i }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvor bor den andre forelderen?' }).should('not.exist');

      cy.withinComponent('Har den andre forelderen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Hva er den andre forelderens fødselsnummer eller d-nummer/i).should('not.exist');
      cy.findByRole('textbox', { name: /utenlandske fødselsnummer/i }).should('exist');
      cy.findByRole('combobox', { name: 'Hvor bor den andre forelderen?' }).should('exist');

      cy.withinComponent('Kan du gi oss navnet på den andre forelderen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.exist');
      cy.findByRole('textbox', { name: /utenlandske fødselsnummer/i }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvor bor den andre forelderen?' }).should('not.exist');
    });

    it('shows rights follow-up only when you are not alone om omsorgen', () => {
      cy.withinComponent('Kan du gi oss navnet på den andre forelderen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Er du alene om omsorgen av barnet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger/i).should('not.exist');

      cy.withinComponent('Er du alene om omsorgen av barnet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger/i).should('exist');
    });
  });

  describe('Opphold i utland – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140509/oppholdIUtland?sub=paper');
      cy.defaultWaits();
    });

    it('shows and hides foreign-stay datagrids based on where you live', () => {
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bo i utlandet helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('exist');

      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bodd i utlandet helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });

      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from arbeidsforhold og inntekt', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140509/arbeidsforholdOgInntekt?sub=paper');
      cy.defaultWaits();
    });

    it('shows termindato attachment only when applicant does not have arbeidsforhold i Norge', () => {
      cy.withinComponent('Har du arbeidsforhold i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Bekreftelse på termindato/ }).should('exist');
    });

    it('hides termindato attachment when applicant has arbeidsforhold i Norge', () => {
      cy.withinComponent('Har du arbeidsforhold i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Bekreftelse på termindato/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140509?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      const birthDate = formatDate(addDays(new Date(), -30));
      const termDate = formatDate(addDays(new Date(), -37));
      const modrekvoteFrom = formatDate(addDays(new Date(), 1));
      const modrekvoteTo = formatDate(addDays(new Date(), 15));

      // Veiledning
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg har lest og forstått mine plikter.',
      }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
      }).click();
      cy.clickNextStep();

      // Dine opplysninger
      fillApplicantIdentity();
      cy.clickNextStep();

      // Din situasjon
      cy.withinComponent('Hvem er du?', () => {
        cy.findByRole('radio', { name: 'Mor' }).click();
      });
      cy.withinComponent('Hvor lang periode med foreldrepenger ønsker du?', () => {
        cy.findByRole('radio', { name: '100 prosent foreldrepenger' }).click();
      });
      cy.clickNextStep();

      // Barnet
      cy.withinComponent(/Er barnet født\?/i, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvor mange barn fikk du?').type('1');
      cy.findByRole('textbox', { name: /Når ble barnet født/ }).type(birthDate);
      cy.findByRole('textbox', { name: /Når var termindato/ }).type(termDate);
      cy.withinComponent('Ble barnet født i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Den andre forelderen
      cy.withinComponent('Kan du gi oss navnet på den andre forelderen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har den andre forelderen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hva er den andre forelderens fødselsnummer/i }).type('01017010170');
      cy.withinComponent('Er du alene om omsorgen av barnet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Har den andre forelderen rett til foreldrepenger/i, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Har du orientert den andre forelderen om søknaden din/i, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Din plan med foreldrepenger
      cy.findByRole('group', { name: /Hvilken periode skal du ta ut/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Mødrekvote' }).check();
      });
      cy.findByRole('textbox', { name: /Mødrekvote fra og med dato/ }).type(modrekvoteFrom);
      cy.findByRole('textbox', { name: /Mødrekvote til og med dato/ }).type(modrekvoteTo);
      cy.withinComponent('Skal den andre forelderen ha foreldrepenger i samme periode?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Skal du kombinere foreldrepengene med delvis arbeid\?/i, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Opphold i utland
      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });
      cy.clickNextStep();

      // Arbeidsforhold og inntekt
      cy.withinComponent('Har du arbeidsforhold i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du jobbet og hatt inntekt som frilanser de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du hatt andre inntektskilder de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – only annen dokumentasjon remains on this happy path
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvem er du?');
        cy.get('dd').eq(0).should('contain.text', 'Mor');
      });
      cy.withinSummaryGroup('Den andre forelderen', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
      });
    });
  });
});
