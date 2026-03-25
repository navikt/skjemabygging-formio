/*
 * Production form tests for Søknad om unntak fra arbeidsgiveransvar for sykepenger
 * Form: nav082020
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 11 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (show when ja),
 *         fodselsdatoDdMmAaaaSoker (show when nei), borDuINorge (show when nei)
 *       borDuINorge → vegadresseEllerPostboksadresse (show when ja),
 *         navSkjemagruppeUtland / utenlandsk adresse fields (show when nei)
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse fields (show when vegadresse),
 *         navSkjemagruppePostboksadresse fields (show when postboksadresse)
 *       jegHarIkkeTelefonnummer → telefonnummerSoker (hide when checked),
 *         hvordanOnskerDuABliKontaktet (show when checked)
 *       harDuEtArbeidsforholdIDag → stilling (show when ja)
 *   - Tiltak (tiltak): 1 same-panel conditional
 *       harDinArbeidsgiverForsoktAGiDegAnnetPassendeArbeid → vetDuOmArbeidsgiverHarVurdertAGiDegAnnetPassendeArbeid (show when nei)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — handled via stepper in summary flow
 */

describe('nav082020', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – norsk fødselsnummer conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082020/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when ja, fødselsdato and borDuINorge when nei', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');
    });
  });

  describe('Dine opplysninger – adresse conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082020/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address-type question when bor i Norge, vegadresse or postboks form', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
    });
  });

  describe('Dine opplysninger – telefonnummer og arbeidsforhold', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082020/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('hides phone and shows alternative contact when checkbox is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('textbox', { name: 'Hvordan ønsker du å bli kontaktet?' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).check();

      cy.findByLabelText('Telefonnummer').should('not.exist');
      cy.findByRole('textbox', { name: 'Hvordan ønsker du å bli kontaktet?' }).should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).uncheck();
      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('textbox', { name: 'Hvordan ønsker du å bli kontaktet?' }).should('not.exist');
    });

    it('shows stilling when har arbeidsforhold i dag', () => {
      cy.findByRole('textbox', { name: 'Stilling' }).should('not.exist');

      cy.withinComponent('Har du et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Stilling' }).should('exist');

      cy.withinComponent('Har du et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Stilling' }).should('not.exist');
    });

    it('shows Arbeidsgiver and Tiltak panels in stepper when har arbeidsforhold i dag', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidsgiver' }).should('not.exist');
      cy.findByRole('link', { name: 'Tiltak' }).should('not.exist');

      cy.withinComponent('Har du et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('link', { name: 'Arbeidsgiver' }).should('exist');
      cy.findByRole('link', { name: 'Tiltak' }).should('exist');

      cy.withinComponent('Har du et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('link', { name: 'Arbeidsgiver' }).should('not.exist');
      cy.findByRole('link', { name: 'Tiltak' }).should('not.exist');
    });
  });

  describe('Tiltak – arbeidsgiver conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082020?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // past start page to Veiledning
      cy.clickNextStep(); // past Veiledning to dineOpplysninger
      // Arbeidsgiver and Tiltak panels are conditionally hidden until harDuEtArbeidsforholdIDag=ja
      cy.withinComponent('Har du et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tiltak' }).click();
    });

    it('shows vetDuOm question when arbeidsgiver ikke har forsøkt', () => {
      cy.findByLabelText('Vet du om arbeidsgiver har vurdert å gi deg annet passende arbeid?').should('not.exist');

      cy.withinComponent('Har din arbeidsgiver forsøkt å gi deg annet passende arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Vet du om arbeidsgiver har vurdert å gi deg annet passende arbeid?').should('exist');

      cy.withinComponent('Har din arbeidsgiver forsøkt å gi deg annet passende arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Vet du om arbeidsgiver har vurdert å gi deg annet passende arbeid?').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082020?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – choose Ja for norsk fnr (no address required)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /forventet termin.*dd\.mm\.åååå/i }).type('01.06.2025');
      cy.withinComponent('Har du et arbeidsforhold i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Stilling' }).type('Sykepleier');
      cy.clickNextStep();

      // Arbeidsgiver
      cy.findByRole('textbox', { name: 'Arbeidsgivers navn' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Arbeidsgivers kontaktperson' }).type('Kari Kontakt');
      cy.findByLabelText('Telefonnummer').type('98765432');
      cy.findByRole('textbox', { name: 'Postadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Tiltak
      cy.findByRole('textbox', { name: /Hvilke tiltak er forsøkt/ }).type('Tilpasset arbeid er vurdert');
      cy.withinComponent('Har din arbeidsgiver forsøkt å gi deg annet passende arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gi en kort begrunnelse/ }).type('Tiltak er ikke mulig');

      // Vedlegg – isAttachmentPanel=true, last panel → use stepper (Case A)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
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
      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgivers navn');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Tiltak', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilke tiltak er forsøkt');
        cy.get('dd').eq(0).should('contain.text', 'Tilpasset arbeid er vurdert');
      });
    });
  });
});
