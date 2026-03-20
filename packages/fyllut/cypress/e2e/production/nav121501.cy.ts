/*
 * Production form tests for Søknad om barnetillegg for deg som har uføretrygd
 * Form: nav121501
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet, applicant alerts
 *   - Egen inntekt (egenInntekt): 7 same-panel conditionals
 *       each income radiopanel → matching amount field
 *   - Ektefelle/samboer/partner (ektefelleSamboerPartner): 10 same-panel conditionals
 *       harDuEktefelleSamboerEllerPartner → parent question + spouse container
 *       spouse identity choice → fnr or birth date field
 *       spouse income radiopanels → matching amount fields
 *   - Barn (barn): conditional chain inside datagrid
 *       child identity choice → fnr or birth date + picture ID question
 *       address/custody/support answers → downstream fields and alert
 *   - Vedlegg (vedlegg): 3 cross-panel attachment conditionals from Barn datagrid
 *       no Norwegian ID child → Fødselsattest
 *       child picture ID = ja → Pass/ID-papirer
 *       NAV bidrag = nei → Avtale om samvær
 */

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const incomeConditionals = [
  {
    question: 'Har du eller forventer du å få arbeidsinntekt?',
    amountLabel: /Årlig brutto arbeidsinntekt/,
  },
  {
    question: 'Mottar du en eller flere pensjonsgivende ytelser fra NAV?',
    amountLabel: /Forventet brutto årlig pensjonsgivende ytelser/,
  },
  {
    question: 'Har du eller forventer du å få næringsinntekt?',
    amountLabel: /Brutto årlig næringsinntekt/,
  },
  {
    question: 'Har du eller forventer du å få inntekt fra utlandet?',
    amountLabel: /Brutto årsinntekt fra utlandet/,
  },
  {
    question: 'Mottar du pensjon fra andre enn NAV (offentlig eller privat)?',
    amountLabel: /Brutto årlig pensjon fra andre enn NAV/,
  },
  {
    question: 'Mottar du familiepleieytelse og/eller krigspensjon fra NAV?',
    amountLabel: /Brutto årlig familiepleieytelse og krigspensjon fra NAV/,
  },
  {
    question: 'Mottar du pensjon fra utlandet?',
    amountLabel: /Brutto årlig pensjon fra utlandet/,
  },
] as const;

const spouseIncomeConditionals = [
  {
    question: 'Har din ektefelle/samboer/partner arbeidsinntekt?',
    amountLabel: /Årlig brutto arbeidsinntekt/,
  },
  {
    question: 'Mottar din ektefelle/samboer/partner en eller flere pensjonsgivende ytelser fra NAV?',
    amountLabel: /Forventet brutto årlig pensjonsgivende ytelser/,
  },
  {
    question: 'Har din ektefelle/partner/samboer næringsinntekt?',
    amountLabel: /Brutto årlig næringsinntekt/,
  },
  {
    question: 'Har din ektefelle inntekt fra utlandet?',
    amountLabel: /Brutto årsinntekt fra utlandet/,
  },
  {
    question: 'Mottar din ektefelle/partner/samboer pensjon fra andre enn NAV (offentlig eller privat)?',
    amountLabel: /Brutto årlig pensjon fra andre enn NAV/,
  },
  {
    question: 'Mottar han/hun introduksjonsstønad, supplerende stønad og/eller krigspensjon fra NAV?',
    amountLabel: /Brutto årlig introduksjonsstønad, supplerende stønad og krigspensjon fra NAV/,
  },
  {
    question: 'Mottar ektefelle/samboer/partner pensjon fra utlandet?',
    amountLabel: /Brutto årlig pensjon fra utlandet/,
  },
] as const;

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav121501/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const fillChildForConditionalAttachments = () => {
  cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Sara');
  cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
  selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Nei');
  cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.2015');
  selectRadio('Har barnet eller barna legitimasjon med bilde?', 'Ja');
  selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Nei');
  selectRadio('Har dere avtale om delt bosted etter barneloven § 36?', 'Nei');
  selectRadio('Bor barnet med deg?', 'Nei');
  selectRadio('Forsørger du barnet?', 'Ja');
  selectRadio('Betales det bidrag for barnet via Nav?', 'Nei');
  selectRadio('Er barnet ditt fosterbarn?', 'Nei');
};

const goToVedleggFromBarn = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

describe('nav121501', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('shows foreign address fields when applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByLabelText('Bor du i Norge?').should('exist');
      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });

    it('shows folkeregister alert and hides address fields when applicant has Norwegian identity number', () => {
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Egen inntekt conditionals', () => {
    beforeEach(() => {
      visitPanel('egenInntekt');
    });

    it('toggles every income amount field from its yes-no question', () => {
      incomeConditionals.forEach(({ question, amountLabel }) => {
        cy.findByLabelText(amountLabel).should('not.exist');

        selectRadio(question, 'Ja');
        cy.findByLabelText(amountLabel).should('exist');

        selectRadio(question, 'Nei');
        cy.findByLabelText(amountLabel).should('not.exist');
      });
    });
  });

  describe('Ektefelle/samboer/partner conditionals', () => {
    beforeEach(() => {
      visitPanel('ektefelleSamboerPartner');
    });

    it('shows spouse questions only when applicant has spouse or partner', () => {
      cy.findByLabelText('Er din ektefelle/samboer/partner forelder til barnet du søker barnetillegg for?').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Ektefelles/partners/samboers fornavn' }).should('not.exist');

      selectRadio('Har du ektefelle, samboer eller partner?', 'Ja');

      cy.findByLabelText('Er din ektefelle/samboer/partner forelder til barnet du søker barnetillegg for?').should(
        'exist',
      );
      cy.findByRole('textbox', { name: 'Ektefelles/partners/samboers fornavn' }).should('exist');

      selectRadio('Har du ektefelle, samboer eller partner?', 'Nei');
      cy.findByLabelText('Er din ektefelle/samboer/partner forelder til barnet du søker barnetillegg for?').should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Ektefelles/partners/samboers fornavn' }).should('not.exist');
    });

    it('toggles spouse identity and all spouse income amount fields', () => {
      selectRadio('Har du ektefelle, samboer eller partner?', 'Ja');
      selectRadio('Er din ektefelle/samboer/partner forelder til barnet du søker barnetillegg for?', 'Ja');

      cy.findByRole('textbox', { name: 'Ektefelles/partners/samboers fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Ektefelles/partners/samboers etternavn' }).type('Nordmann');

      cy.findByLabelText('Ektefelles/partners/samboers fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', {
        name: /Ektefelles\/partners\/samboers fødselsdato\/ D-nummer/,
      }).should('not.exist');

      selectRadio('Har din ektefelle/partner norsk fødselsnummer eller D-nummer?', 'Ja');
      cy.findByLabelText('Ektefelles/partners/samboers fødselsnummer / D-nummer').should('exist');

      selectRadio('Har din ektefelle/partner norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByLabelText('Ektefelles/partners/samboers fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', {
        name: /Ektefelles\/partners\/samboers fødselsdato\/ D-nummer/,
      }).should('exist');

      spouseIncomeConditionals.forEach(({ question, amountLabel }) => {
        cy.findByLabelText(amountLabel).should('not.exist');

        selectRadio(question, 'Ja');
        cy.findByLabelText(amountLabel).should('exist');

        selectRadio(question, 'Nei');
        cy.findByLabelText(amountLabel).should('not.exist');
      });
    });
  });

  describe('Barn conditionals', () => {
    beforeEach(() => {
      visitPanel('barn');
    });

    it('switches between Norwegian-ID and non-Norwegian child identity fields', () => {
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Har barnet eller barna legitimasjon med bilde?').should('not.exist');

      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Ja');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');

      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');
      cy.findByLabelText('Har barnet eller barna legitimasjon med bilde?').should('exist');
    });

    it('walks the custody and support conditional chain to the NAV-bidrag alert', () => {
      cy.findByLabelText('Har dere avtale om delt bosted etter barneloven § 36?').should('not.exist');
      cy.findByLabelText('Bor barnet med deg?').should('not.exist');
      cy.findByLabelText('Forsørger du barnet?').should('not.exist');
      cy.findByLabelText('Betales det bidrag for barnet via Nav?').should('not.exist');

      selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Nei');
      cy.findByLabelText('Har dere avtale om delt bosted etter barneloven § 36?').should('exist');

      selectRadio('Har dere avtale om delt bosted etter barneloven § 36?', 'Nei');
      cy.findByLabelText('Bor barnet med deg?').should('exist');

      selectRadio('Bor barnet med deg?', 'Nei');
      cy.findByLabelText('Forsørger du barnet?').should('exist');

      selectRadio('Forsørger du barnet?', 'Ja');
      cy.findByLabelText('Betales det bidrag for barnet via Nav?').should('exist');

      selectRadio('Betales det bidrag for barnet via Nav?', 'Nei');
      cy.contains('må privat forsørgelses- eller samværsavtale vedlegges søknaden').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows only always-visible attachment when child data does not trigger extra attachments', () => {
      visitPanel('barn');

      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Ola');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Ja');
      selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Ja');
      selectRadio('Er barnet ditt fosterbarn?', 'Nei');

      goToVedleggFromBarn();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
      cy.findByRole('group', { name: /Fødselsattest|fødselsattest/ }).should('not.exist');
      cy.findByRole('group', { name: /legitimasjon|Pass\/ID-papirer/ }).should('not.exist');
      cy.findByRole('group', { name: /samvær|samvaer|Avtale om samvær/ }).should('not.exist');
    });

    it('shows all child-driven attachments when child data requires documentation', () => {
      visitPanel('barn');
      fillChildForConditionalAttachments();

      goToVedleggFromBarn();

      cy.findByRole('group', { name: /Fødselsattest|fødselsattest/ }).should('exist');
      cy.findByRole('group', { name: /legitimasjon|Pass\/ID-papirer/ }).should('exist');
      cy.findByRole('group', { name: /samvær|samvaer|Avtale om samvær/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav121501?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep(); // Introduksjon
      cy.clickNextStep(); // Veiledning

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Egen inntekt
      cy.findByLabelText('Året inntekten gjelder for').type('2025');
      incomeConditionals.forEach(({ question }) => {
        selectRadio(question, 'Nei');
      });
      cy.clickNextStep();

      // Ektefelle/samboer/partner
      selectRadio('Har du ektefelle, samboer eller partner?', 'Nei');
      cy.clickNextStep();

      // Barn – choose non-Norwegian-ID path to keep one conditional attachment in the summary flow
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Sara');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
      selectRadio('Har dette barnet norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.2015');
      selectRadio('Har barnet eller barna legitimasjon med bilde?', 'Nei');
      selectRadio('Bor barnet og begge foreldrene på samme adresse?', 'Ja');
      selectRadio('Er barnet ditt fosterbarn?', 'Nei');
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Fødselsattest|fødselsattest/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
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
      cy.withinSummaryGroup('Egen inntekt', () => {
        cy.get('dt').eq(0).should('contain.text', 'Året inntekten gjelder for');
        cy.get('dd').eq(0).should('contain.text', '2025');
      });
      cy.withinSummaryGroup('Barn', () => {
        cy.contains('dt', /Fornavn|Opplysninger om barn under 18 år/).should('exist');
        cy.contains('dd', 'Sara').should('exist');
      });
    });
  });
});
