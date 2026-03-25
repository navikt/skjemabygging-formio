/*
 * Production form tests for Søknad om engangsstønad ved fødsel
 * Form: nav140507
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Engangsstønad (page4): 3 same-panel conditionals
 *       narErBarnetFodt → termindatoDdMmAaaa (fremITid)
 *       narErBarnetFodt → leggTilBarnetEllerBarnasFodselsdato datagrid (tilbakeITid)
 *       hvaSokerDuOm → datoForOmsorgsovertakelsenAvBarnetDdMmAaaa (omsorgsovertakelse)
 *       + 2 cross-panel triggers to Vedlegg
 *   - Vedlegg (vedlegg, isAttachmentPanel): 2 conditional attachments
 *       terminbekreftelse: hvaSokerDuOm===fødsel AND narErBarnetFodt===fremITid
 *       bekreftelsePaDatoForOmsorgsovertakelse: hvaSokerDuOm===omsorgsovertakelse
 *   - Utenlandsopphold (page5): 2 same-panel conditionals
 *       hvorSkalDuBoDeNeste12Manedene → utenlandsopphold datagrid
 *       hvorHarDuBoddDeSiste12Manedene → utenlandsopphold1 datagrid
 *   - Tilleggsopplysninger (page8): 1 same-panel conditional
 *       harDuTilleggsopplysningerSomErRelevantForSoknaden → tilleggsopplysninger textarea
 */

const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

const getValidFutureTermDate = () => {
  const termDate = new Date();
  termDate.setDate(termDate.getDate() + 14);

  return formatDate(termDate);
};

describe('nav140507', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Engangsstønad – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140507/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows termindato only when barnet er frem i tid', () => {
      cy.findByRole('textbox', { name: /Termindato/ }).should('not.exist');

      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'frem i tid' }).click();
      });
      cy.findByRole('textbox', { name: /Termindato/ }).should('exist');

      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'tilbake i tid' }).click();
      });
      cy.findByRole('textbox', { name: /Termindato/ }).should('not.exist');
    });

    it('shows fødselsdato datagrid only when barnet er tilbake i tid', () => {
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');

      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'tilbake i tid' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');

      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'frem i tid' }).click();
      });
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
    });

    it('shows dato omsorgsovertakelse only for omsorgsovertakelse søknad', () => {
      cy.findByRole('textbox', { name: /omsorgsovertakelsen/ }).should('not.exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', {
          name: 'Engangsstønad ved overtakelse av foreldreansvaret eller omsorgen',
        }).click();
      });
      cy.findByRole('textbox', { name: /omsorgsovertakelsen/ }).should('exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Engangsstønad ved fødsel' }).click();
      });
      cy.findByRole('textbox', { name: /omsorgsovertakelsen/ }).should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachments from page4', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140507/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows terminbekreftelse attachment when fødsel og frem i tid', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Engangsstønad ved fødsel' }).click();
      });
      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'frem i tid' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Terminbekreftelse').should('exist');
    });

    it('hides terminbekreftelse when barnet er tilbake i tid', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Engangsstønad ved fødsel' }).click();
      });
      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'tilbake i tid' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Terminbekreftelse').should('not.exist');
    });

    it('shows bekreftelse på omsorgsovertakelse for omsorgsovertakelse søknad', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', {
          name: 'Engangsstønad ved overtakelse av foreldreansvaret eller omsorgen',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Bekreftelse på dato for omsorgsovertakelse').should('exist');
    });

    it('hides bekreftelse på omsorgsovertakelse for fødselssøknad', () => {
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Engangsstønad ved fødsel' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Bekreftelse på dato for omsorgsovertakelse').should('not.exist');
    });
  });

  describe('Utenlandsopphold – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140507/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows fremtidig utenlandsopphold datagrid when bo i utlandet', () => {
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bo i utlandet helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
    });

    it('shows tidligere utenlandsopphold datagrid when bodd i utlandet', () => {
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');

      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bodd i utlandet helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('exist');

      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140507/page8?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea only when ja', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140507?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      const validFutureTermDate = getValidFutureTermDate();

      // Veiledning
      cy.findByRole('checkbox', {
        name: /Jeg har lest og forstått det som står på nettsiden/,
      }).click();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Engangsstønad – fødsel + frem i tid
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Engangsstønad ved fødsel' }).click();
      });
      cy.withinComponent('Når er barnet født?', () => {
        cy.findByRole('radio', { name: 'frem i tid' }).click();
      });
      cy.findByLabelText('Antall barn').type('1');
      cy.findByRole('textbox', { name: /Termindato/ }).type(validFutureTermDate);
      cy.clickNextStep();

      // Utenlandsopphold – kun i Norge
      cy.withinComponent('Planlegger du å være i Norge på fødselstidspunktet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – ingen tilleggsopplysninger
      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Erklæring (vedlegg skipped by isAttachmentPanel in sequential navigation)
      cy.findByRole('checkbox', {
        name: /De opplysninger jeg har oppgitt er riktige/,
      }).click();

      // Navigate to Vedlegg via stepper, fill it, then continue to Oppsummering
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // terminbekreftelse shown (fødsel + fremITid)
      cy.findByRole('group', { name: /Terminbekreftelse/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      // annenDokumentasjon – no ettersender option, use Nei
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Engangsstønad', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva søker du om?');
        cy.get('dd').eq(0).should('contain.text', 'Engangsstønad ved fødsel');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
