import nav761345Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav761345.json';

/*
 * Production form tests for Søknad om tiltakspenger
 * Form: nav761345
 * Submission types: PAPER
 * introPage.enabled === true — cy.clickIntroPageConfirmation() is required on the root URL.
 *
 * Panels tested:
 *   - Dine opplysninger (dineopplysninger): 3 observable customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       adresse.borDuINorge → adresseVarighet visibility
 *       identitet.harDuFodselsnummer=ja → folkeregister alertstripe
 *   - Introduksjonsstønad og kvalifiseringsstønad (introduksjonsstonadOgKvalifiseringsstonad): 2 same-panel conditionals
 *       mottarDuKvalifiseringsstonad → warning + period fields
 *       mottarDuIntroduksjonsstonad → warning + period fields
 *   - Utbetalinger (utbetalinger): 8 same-panel conditionals
 *       harDuNyligMottattSykepengerOgErFortsattSykmeldt → period fields
 *       mottarDuNoenAvDissePengestottene → selectboxes visibility
 *       oppgiPengestottenDuMottar → 6 payment-specific warning/date branches
 *   - Institusjonsopphold (institusjonsopphold): 1 same-panel conditional
 *       borDuIEnInstitusjonMedGratisOppholdMatOgDrikke → period fields
 *   - Barnetillegg (barnetillegg): 1 same-panel conditional
 *       harDuBarnUnder16ArSomDuForsorgerOgSokerBarnetilleggFor → datagrid
 *       + 1 cross-panel trigger to Vedlegg
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 cross-panel conditional attachment
 *       harDuBarnUnder16ArSomDuForsorgerOgSokerBarnetilleggFor → fodselsattestBostedsbevisForBarnUnder16Ar
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const selectRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const waitForPageTitle = (title?: string) => {
  cy.get('#page-title').should('be.visible');

  if (title) {
    cy.get('#page-title').should('contain.text', title);
  }
};

const visitPanel = (panelKey: string, title: string) => {
  cy.visit(`/fyllut/nav761345/${panelKey}?sub=paper`);
  cy.defaultWaits();
  waitForPageTitle(title);
};

describe('nav761345', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav761345*', { body: nav761345Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav761345*', { body: {} }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineopplysninger', 'Dine opplysninger');
    });

    it('shows address fields and address validity when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });

    it('shows the folkeregister alert and keeps address fields hidden when the applicant has Norwegian identity number', () => {
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Introduksjonsstønad og kvalifiseringsstønad conditionals', () => {
    beforeEach(() => {
      visitPanel('introduksjonsstonadOgKvalifiseringsstonad', 'Introduksjonsstønad og kvalifiseringsstønad');
    });

    it('shows the kvalifiseringsstønad period only when Ja is selected', () => {
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');

      selectRadio('Mottar du kvalifiseringsstønad?', 'Ja');
      cy.contains('Du får ikke tiltakspenger for samme periode som du mottar kvalifiseringsstønad.').should('exist');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');

      selectRadio('Mottar du kvalifiseringsstønad?', 'Nei');
      cy.contains('Du får ikke tiltakspenger for samme periode som du mottar kvalifiseringsstønad.').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('not.exist');
    });

    it('shows the introduksjonsstønad period only when Ja is selected', () => {
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');

      selectRadio('Mottar du introduksjonsstønad', 'Ja');
      cy.contains('Du får ikke tiltakspenger for samme periode som du mottar introduksjonsstønad.').should('exist');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');

      selectRadio('Mottar du introduksjonsstønad', 'Nei');
      cy.contains('Du får ikke tiltakspenger for samme periode som du mottar introduksjonsstønad.').should('not.exist');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Utbetalinger conditionals', () => {
    beforeEach(() => {
      visitPanel('utbetalinger', 'Utbetalinger');
    });

    it('toggles the sykmelding period and payment support selector', () => {
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('group', { name: /Oppgi pengestøtten du mottar/ }).should('not.exist');

      selectRadio('Har du nylig mottatt sykepenger og er fortsatt sykmeldt?', 'Ja');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');

      selectRadio('Har du nylig mottatt sykepenger og er fortsatt sykmeldt?', 'Nei');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('not.exist');

      selectRadio('Mottar du noen av disse pengestøttene?', 'Ja');
      cy.findByRole('group', { name: /Oppgi pengestøtten du mottar/ }).should('exist');

      selectRadio('Mottar du noen av disse pengestøttene?', 'Nei');
      cy.findByRole('group', { name: /Oppgi pengestøtten du mottar/ }).should('not.exist');
    });

    it('shows the matching warning and date fields for each selected payment support', () => {
      selectRadio('Mottar du noen av disse pengestøttene?', 'Ja');

      const assertPaymentBranch = (optionLabel: string, alertText: string, expectsTilDato: boolean = true) => {
        cy.findByRole('group', { name: /Oppgi pengestøtten du mottar/ }).within(() => {
          cy.findByRole('checkbox', { name: optionLabel }).check();
        });

        cy.contains(alertText).should('exist');
        cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');

        if (expectsTilDato) {
          cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');
        } else {
          cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('not.exist');
        }

        cy.findByRole('group', { name: /Oppgi pengestøtten du mottar/ }).within(() => {
          cy.findByRole('checkbox', { name: optionLabel }).uncheck();
        });

        cy.contains(alertText).should('not.exist');
      };

      assertPaymentBranch(
        'Pengestøtte til gjenlevende ektefelle',
        'Når ektefellen, samboeren eller partneren din dør, kan du ha rett til pengestøtte som etterlatt.',
      );
      assertPaymentBranch('Alderspensjon', 'Alderspensjon skal sikre deg inntekt når du blir pensjonist.', false);
      assertPaymentBranch(
        'Supplerende stønad for personer over 67 år',
        'Du kan motta supplerende stønad hvis du er over 67 år',
      );
      assertPaymentBranch(
        'Supplerende stønad for uføre flyktninger',
        'Du kan motta supplerende stønad hvis du er både ufør og har flyktningstatus.',
      );
      assertPaymentBranch(
        'Pengestøtte fra andre trygde- eller pensjonsordninger',
        'Andre trygde- eller pensjonsordninger er pengestøtte du får fra andre enn Nav',
      );
      assertPaymentBranch('Stønad via Jobbsjansen', 'Jobbsjansen er en ordning for hjemmeværende innvandrerkvinner.');
    });
  });

  describe('Institusjonsopphold conditionals', () => {
    beforeEach(() => {
      visitPanel('institusjonsopphold', 'Institusjonsopphold');
    });

    it('shows the institution stay period only when Ja is selected', () => {
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');

      selectRadio('Bor du i en institusjon med gratis opphold, mat og drikke?', 'Ja');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');

      selectRadio('Bor du i en institusjon med gratis opphold, mat og drikke?', 'Nei');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Barnetillegg conditionals', () => {
    beforeEach(() => {
      visitPanel('barnetillegg', 'Barnetillegg');
    });

    it('shows the child datagrid only when Ja is selected', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      selectRadio('Har du barn under 16 år som du forsørger og vil søke barnetillegg for?', 'Ja');
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).should('exist');

      selectRadio('Har du barn under 16 år som du forsørger og vil søke barnetillegg for?', 'Nei');
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).should('not.exist');
    });
  });

  describe('Vedlegg conditional attachment from Barnetillegg', () => {
    beforeEach(() => {
      visitPanel('barnetillegg', 'Barnetillegg');
    });

    it('shows the child certificate attachment when barnetillegg is requested', () => {
      selectRadio('Har du barn under 16 år som du forsørger og vil søke barnetillegg for?', 'Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fødselsattest\/bostedsbevis for barn under 16 år/ }).should('exist');
    });

    it('hides the child certificate attachment when barnetillegg is not requested', () => {
      selectRadio('Har du barn under 16 år som du forsørger og vil søke barnetillegg for?', 'Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fødselsattest\/bostedsbevis for barn under 16 år/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761345?sub=paper');
      cy.defaultWaits();
      waitForPageTitle();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger — use the FNR path to keep address fields hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Tiltaket
      cy.findByRole('textbox', { name: 'Navn på tiltaket' }).type('Arbeidsrettet kurs');
      cy.findByRole('textbox', { name: 'Oppstartsdato for tiltaket (dd.mm.åååå)' }).type(dateOffset(7));
      cy.findByRole('textbox', { name: 'Sluttdato for tiltaket (dd.mm.åååå)' }).type(dateOffset(37));
      cy.clickNextStep();

      // Introduksjonsstønad og kvalifiseringsstønad
      selectRadio('Mottar du kvalifiseringsstønad?', 'Nei');
      selectRadio('Mottar du introduksjonsstønad', 'Nei');
      cy.clickNextStep();

      // Utbetalinger
      selectRadio('Mottar du etterlønn fra en tidligere arbeidsgiver?', 'Nei');
      selectRadio('Har du nylig mottatt sykepenger og er fortsatt sykmeldt?', 'Nei');
      selectRadio('Mottar du noen av disse pengestøttene?', 'Nei');
      cy.clickNextStep();

      // Institusjonsopphold
      selectRadio('Bor du i en institusjon med gratis opphold, mat og drikke?', 'Nei');
      cy.clickNextStep();

      // Barnetillegg
      selectRadio('Har du barn under 16 år som du forsørger og vil søke barnetillegg for?', 'Nei');

      // Vedlegg — isAttachmentPanel=true and last panel, so use the stepper before Oppsummering
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Tiltaket', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på tiltaket');
        cy.get('dd').eq(0).should('contain.text', 'Arbeidsrettet kurs');
      });
      cy.withinSummaryGroup('Barnetillegg', () => {
        cy.contains('dd', 'Nei').should('exist');
      });
    });
  });
});
