/*
 * Production form tests for Innsyn med fullmakt eller samtykke
 * Form: nav361302
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personen du ber om opplysninger om (personenDuBerOmOpplysningerOm): 5 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (ja) / fodselsdato+borINorge (nei)
 *       borPersonenINorge → vegadresseEllerPostboksadresse (ja) / utenlandskAdresse (nei)
 *       vegadresseEllerPostboksadresse → vegadresse container (vegadresse) / postboks container (postboksadresse)
 *   - Du som ber om innsyn (duSomBerOmInnsyn): 4 same-panel conditionals
 *       harFirmaetNorskAdresse1 → erFirmaetsKontaktadresse... (ja) / utenlandskAdresse (nei)
 *       erFirmaetsKontaktadresseEnVegadresseEllerPostboksadresse → vegadresse (vegadresse) / postboks (postboksadresse)
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 4 cross-panel conditionals from hvaGjelderHenvendelsen
 *       nyttKravOmInnsyn → kravOmInnsyn attachment
 *       purring → purring attachment
 *       innsendingAvMerDokumentasjon → merDokumentasjon + annenDokumentasjon attachments
 *       klage → klage attachment
 *       fullmaktEllerSamtykke is always shown
 */

describe('nav361302', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Personen du ber om opplysninger om – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361302/personenDuBerOmOpplysningerOm?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when harDuNorskFodselsnummerEllerDNummer is ja, hides it when nei', () => {
      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');
      cy.findByLabelText(/Fødselsdato/).should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer eller d-nummer').should('exist');
      cy.findByLabelText(/Fødselsdato/).should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');
      cy.findByLabelText(/Fødselsdato/).should('exist');
    });

    it('shows borPersonenINorge and address-type question when nei, and correct address containers', () => {
      cy.findByLabelText('Bor personen i Norge?').should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor personen i Norge?').should('exist');
      cy.findByLabelText('Er personens kontaktadresse en vegadresse eller postboksadresse?').should('not.exist');

      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er personens kontaktadresse en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Er personens kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er personens kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
    });

    it('shows foreign address fields when borPersonenINorge is nei', () => {
      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, ev. postboks' }).should('exist');
      cy.findByLabelText('Er personens kontaktadresse en vegadresse eller postboksadresse?').should('not.exist');
    });
  });

  describe('Du som ber om innsyn – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361302/duSomBerOmInnsyn?sub=paper');
      cy.defaultWaits();
    });

    it('shows address-type question only when firm has Norwegian address', () => {
      cy.findByLabelText('Er firmaets kontaktadresse en vegadresse eller postboksadresse?').should('not.exist');

      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er firmaets kontaktadresse en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er firmaets kontaktadresse en vegadresse eller postboksadresse?').should('not.exist');
    });

    it('shows vegadresse container when vegadresse, postboks container when postboksadresse', () => {
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Er firmaets kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er firmaets kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
    });

    it('shows foreign address fields when firm has no Norwegian address', () => {
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachments from hvaGjelderHenvendelsen', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361302/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows kravOmInnsyn attachment when nyttKravOmInnsyn is selected', () => {
      cy.findByRole('checkbox', { name: 'Nytt krav om innsyn' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Krav om innsyn/ }).should('exist');
      cy.findByRole('group', { name: /Purring/ }).should('not.exist');
      cy.findByRole('group', { name: /Mer dokumentasjon/ }).should('not.exist');
      cy.findByRole('group', { name: /^Klage/ }).should('not.exist');
    });

    it('shows purring attachment when purring is selected', () => {
      cy.findByRole('checkbox', { name: 'Purring' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Purring/ }).should('exist');
      cy.findByRole('group', { name: /Krav om innsyn/ }).should('not.exist');
    });

    it('shows merDokumentasjon and hides annenDokumentasjon when innsendingAvMerDokumentasjon is selected', () => {
      cy.findByRole('checkbox', { name: 'Innsending av mer dokumentasjon' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Mer dokumentasjon/ }).should('exist');
      // annenDokumentasjon has show=false for innsendingAvMerDokumentasjon — it is hidden in this case
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('not.exist');
      cy.findByRole('group', { name: /Krav om innsyn/ }).should('not.exist');
    });

    it('shows annenDokumentasjon attachment when selection is not innsendingAvMerDokumentasjon', () => {
      cy.findByRole('checkbox', { name: 'Nytt krav om innsyn' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // annenDokumentasjon (attachmentType=other) is shown by default, hidden only for innsendingAvMerDokumentasjon
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });

    it('shows klage attachment when klage is selected', () => {
      cy.findByRole('checkbox', { name: 'Klage' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /^Klage/ }).should('exist');
      cy.findByRole('group', { name: /Krav om innsyn/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361302?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning – select nyttKravOmInnsyn to trigger kravOmInnsyn attachment
      cy.findByRole('checkbox', { name: 'Nytt krav om innsyn' }).check();
      cy.clickNextStep();

      // Personen du ber om opplysninger om – use ja path (fnr provided, no address required)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer eller d-nummer').type('17912099997');
      cy.clickNextStep();

      // Du som ber om innsyn – norsk adresse = ja, vegadresse
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Saksbehandler');
      cy.findByRole('textbox', { name: 'Navn på firmaet du representerer' }).type('Test AS');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er firmaets kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');

      // Vedlegg – isAttachmentPanel=true: navigate via stepper then clickNextStep to Oppsummering
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // kravOmInnsyn has only leggerVedNaa and levertTidligere enabled
      cy.findByRole('group', { name: /Krav om innsyn/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg har levert denne dokumentasjonen tidligere' }).click();
      });
      // fullmaktEllerSamtykke is always required
      cy.findByRole('group', { name: /Fullmakt eller samtykke/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      // annenDokumentasjon (attachmentType=other) is shown when nyttKravOmInnsyn is selected
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personen du ber om opplysninger om', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Du som ber om innsyn', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
