/*
 * Production form tests for Fordeling av barns reisekostnader ved samvær
 * Form: nav554401
 * Submission types: PAPER, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 conditionals
 *       identitet.harDuFodselsnummer → adresse (navAddress), alertstripe
 *   - Motpartens opplysninger (motpartensOpplysninger): 6 conditionals
 *       harMotpartenNorskFodselsnummerEllerDNummer → motpartensFodselsnummerDNummer
 *       harMotpartenNorskFodselsnummerEllerDNummer → motpartensFodselsdatoDdMmAaaa + borMotpartenINorge
 *       borMotpartenINorge → vetDuAdressen
 *       borMotpartenINorge + vetDuAdressen → bostedsadresse1 / utenlandskAdresse1 / hvilketLandBorMotpartenI
 *       jegKjennerIkkeMotpartensTelefonnummer → motpartensTelefonnummer
 *   - Barn som søknaden gjelder for (barnSomSoknadenGjelderFor): 3 conditionals
 *       barnetHarIkkeNorskFodselsnummerEllerDNummer → barnetsFodselsnummerDNummer / barnetsFodselsdatoDdMmAaaa
 *       erBarnetBosattUtenforNorge → hvilketLandBorBarnetI
 *       hvaGjelderSoknadenForDetteBarnet → avtaleOmFordelingAvReisekostnader (cross-panel to Vedlegg)
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 conditional attachment
 *       hvaGjelderSoknadenForDetteBarnet (in datagrid) → avtaleOmFordelingAvReisekostnader
 */

describe('nav554401', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav554401/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse when harDuFodselsnummer is nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse when harDuFodselsnummer is ja', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Motpartens opplysninger – harMotpartenNorsk conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav554401/motpartensOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field and hides borMotpartenINorge when harMotpartenNorsk is ja', () => {
      cy.findByRole('textbox', { name: /Motpartens fødselsnummer/i }).should('not.exist');
      cy.findByLabelText('Bor motparten i Norge?').should('not.exist');

      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Motpartens fødselsnummer/i }).should('exist');
      cy.findByLabelText('Bor motparten i Norge?').should('not.exist');
    });

    it('shows fødselsdato and borMotpartenINorge when harMotpartenNorsk is nei', () => {
      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Motpartens\s+fødselsdato/i }).should('exist');
      cy.findByLabelText('Bor motparten i Norge?').should('exist');
    });

    it('shows vetDuAdressen when borMotpartenINorge is set', () => {
      cy.findByLabelText('Vet du adressen?').should('not.exist');

      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor motparten i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Vet du adressen?').should('exist');
    });

    it('shows Norwegian address fields when borMotpartenINorge ja and vetDuAdressen ja', () => {
      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor motparten i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('exist');
    });

    it('shows foreign address fields when borMotpartenINorge nei and vetDuAdressen ja', () => {
      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor motparten i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });

    it('shows country picker when borMotpartenINorge nei and vetDuAdressen nei', () => {
      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor motparten i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('combobox', { name: /Hvilket land bor motparten i/i }).should('exist');
    });

    it('hides phone number when jegKjennerIkkeMotpartensTelefonnummer is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Jeg kjenner ikke motpartens telefonnummer/ }).click();

      cy.findByLabelText('Telefonnummer').should('not.exist');
    });
  });

  describe('Barn som søknaden gjelder for – datagrid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav554401/barnSomSoknadenGjelderFor?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr/fødselsdato in datagrid when barnetHarIkkeNorsk checkbox is checked', () => {
      cy.findAllByRole('textbox', { name: /Barnets fødselsnummer/i })
        .first()
        .should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/i }).should('not.exist');

      cy.findByRole('checkbox', { name: /Barnet har ikke.*fødselsnummer/ }).click();

      cy.findAllByRole('textbox', { name: /Barnets fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/i }).should('exist');
    });

    it('shows land picker in datagrid when barnet er bosatt utenfor Norge', () => {
      cy.findByRole('combobox', { name: /Hvilket land bor barnet i/i }).should('not.exist');

      cy.withinComponent('Er barnet bosatt utenfor Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('combobox', { name: /Hvilket land bor barnet i/i }).should('exist');
    });
  });

  describe('Vedlegg – conditional attachment', () => {
    it('shows avtale attachment when hvaGjelderSoknad is stadfestelse', () => {
      cy.visit('/fyllut/nav554401/barnSomSoknadenGjelderFor?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Hva gjelder søknaden for dette barnet?', () => {
        cy.findByRole('radio', { name: /Stadfestelse av avtale/ }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Avtale om fordeling av reisekostnader/ }).should('exist');
    });

    it('hides avtale attachment when hvaGjelderSoknad is forespørsel', () => {
      cy.visit('/fyllut/nav554401/barnSomSoknadenGjelderFor?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Hva gjelder søknaden for dette barnet?', () => {
        cy.findByRole('radio', { name: /Forespørsel om fordeling/ }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Avtale om fordeling av reisekostnader/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav554401?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, skip
      cy.clickNextStep();

      // Dine opplysninger – choose ja for fnr so adresse/adresseVarighet stay hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Motpartens opplysninger – choose ja so borMotpartenINorge and address fields stay hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har motparten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Motpartens fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('98765432');
      cy.clickNextStep();

      // Barn som søknaden gjelder for – fill datagrid first row
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Liten');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Nordmann');
      cy.findAllByRole('textbox', { name: /Barnets fødselsnummer/i })
        .first()
        .type('17912099997');
      cy.withinComponent('Er barnet bosatt utenfor Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Hva gjelder søknaden for dette barnet?', () => {
        cy.findByRole('radio', { name: /Forespørsel om fordeling/ }).click();
      });

      // Vedlegg (isAttachmentPanel=true) – sequential clickNextStep() skips it; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // avtaleOmFordelingAvReisekostnader not shown (forespørsel path), fill annenDokumentasjon
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Motpartens opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
