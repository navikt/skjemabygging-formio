/*
 * Production form tests for Innsyn med hjemmel
 * Form: nav361301
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): cross-panel triggers to Vedlegg (isAttachmentPanel=true)
 *       hvaGjelderHenvendelsen (selectboxes) → kravOmInnsyn, purring, merDokumentasjon, klage attachments
 *       hvaGjelderHenvendelsen=innsendingAvMerDokumentasjon → hides annenDokumentasjon
 *       berDuOmMerInnsynEnnDetLovhjemmelenInkluderer → fullmaktEllerSamtykke attachment
 *   - Personen du ber om opplysninger om (personenDuBerOmOpplysningerOm): identity and address conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fnr field / fødselsdato + borPersonenINorge
 *       borPersonenINorge → vegadresseEllerPostboksadresse / utenlandsk adresse
 *       vegadresseEllerPostboksadresse → vegadresse / postboksadresse sections
 *   - Du som ber om innsyn (page4): firm address conditionals
 *       harFirmaetNorskAdresse1 → address type question / utenlandsk adresse
 *       erFirmaetsKontaktadresseEnVegadresseEllerPostboksadresse → vegadresse / postboksadresse sections
 *   - Vedlegg (vedlegg): isAttachmentPanel=true; 5 conditional + 1 default-shown attachment
 */

describe('nav361301', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Vedlegg – conditional attachments from hvaGjelderHenvendelsen', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361301/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows kravOmInnsyn attachment when nyttKravOmInnsyn is checked', () => {
      cy.findByRole('checkbox', { name: 'Nytt krav om innsyn' }).click();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Krav om innsyn/ }).should('exist');
      cy.findByRole('group', { name: /Purring/ }).should('not.exist');
      cy.findByRole('group', { name: /Mer dokumentasjon/ }).should('not.exist');
    });

    it('shows purring attachment when purring is checked', () => {
      cy.findByRole('checkbox', { name: 'Purring' }).click();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Purring/ }).should('exist');
      cy.findByRole('group', { name: /Krav om innsyn/ }).should('not.exist');
    });

    it('shows merDokumentasjon and hides annenDokumentasjon when innsendingAvMerDokumentasjon is checked', () => {
      cy.findByRole('checkbox', { name: 'Innsending av mer dokumentasjon' }).click();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Mer dokumentasjon/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('not.exist');
    });

    it('shows klage attachment when klage is checked', () => {
      cy.findByRole('checkbox', { name: 'Klage' }).click();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Klage/ }).should('exist');
      cy.findByRole('group', { name: /Krav om innsyn/ }).should('not.exist');
    });

    it('shows annenDokumentasjon by default when innsendingAvMerDokumentasjon is not checked', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Vedlegg – fullmaktEllerSamtykke from berDuOmMerInnsynEnnDetLovhjemmelenInkluderer', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361301/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows fullmaktEllerSamtykke attachment when berDuOmMerInnsynEnnDetLovhjemmelenInkluderer=ja', () => {
      cy.withinComponent('Ber du om mer innsyn enn det lovhjemmelen inkluderer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt eller samtykke/ }).should('exist');
    });

    it('hides fullmaktEllerSamtykke attachment when berDuOmMerInnsynEnnDetLovhjemmelenInkluderer=nei', () => {
      cy.withinComponent('Ber du om mer innsyn enn det lovhjemmelen inkluderer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt eller samtykke/ }).should('not.exist');
    });
  });

  describe('Personen du ber om opplysninger om – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361301/personenDuBerOmOpplysningerOm?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when harDuNorskFodselsnummerEllerDNummer=ja', () => {
      cy.findByLabelText('Fødselsnummer eller d-nummer').should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Fødselsnummer eller d-nummer').should('exist');
    });

    it('shows fødselsdato and borPersonenINorge when harDuNorskFodselsnummerEllerDNummer=nei', () => {
      cy.findByLabelText('Fødselsdato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Bor personen i Norge?').should('not.exist');

      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Bor personen i Norge?').should('exist');
    });

    it('shows vegadresse fields when borPersonenINorge=ja and Vegadresse is chosen', () => {
      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er personens kontaktadresse en vegadresse eller postboksadresse?').should('exist');
      cy.withinComponent('Er personens kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
    });

    it('shows postboksadresse fields when borPersonenINorge=ja and Postboksadresse is chosen', () => {
      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er personens kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('shows utenlandsk adresse when borPersonenINorge=nei', () => {
      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Du som ber om innsyn – firm address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361301/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows address type question when harFirmaetNorskAdresse1=ja', () => {
      cy.findByLabelText('Er firmaets kontaktadresse en vegadresse eller postboksadresse?').should('not.exist');

      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er firmaets kontaktadresse en vegadresse eller postboksadresse?').should('exist');
    });

    it('shows vegadresse fields when vegadresse is chosen for firm address', () => {
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er firmaets kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
    });

    it('shows postboksadresse fields when postboksadresse is chosen for firm address', () => {
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er firmaets kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });

    it('shows utenlandsk adresse when harFirmaetNorskAdresse1=nei', () => {
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav361301?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – nyttKravOmInnsyn path, no extra innsyn
      cy.findByRole('checkbox', { name: 'Nytt krav om innsyn' }).click();
      cy.withinComponent('Ber du om mer innsyn enn det lovhjemmelen inkluderer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Personen du ber om opplysninger om – ja for fnr path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har personen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer eller d-nummer').type('17912099997');
      cy.clickNextStep();

      // Du som ber om innsyn – Norwegian vegadresse path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Søker');
      cy.findByRole('textbox', { name: 'Navn på firmaet du representerer' }).type('Testfirma AS');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Har firmaet norsk adresse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er firmaets kontaktadresse en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');

      // Vedlegg – isAttachmentPanel=true; navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // nyttKravOmInnsyn checked → kravOmInnsyn shown; annenDokumentasjon shown (not innsendingAvMerDokumentasjon)
      // kravOmInnsyn has only leggerVedNaa and levertTidligere enabled (no ettersender)
      cy.findByRole('group', { name: /Krav om innsyn/ }).within(() => {
        cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
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
