/*
 * Production form tests for Søknad om supplerende stønad til personer over 67 år
 * Form: nav642100
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Hjelp til utfylling av søknaden (hjelpTilUtfyllingAvSoknaden): 5 same-panel conditionals
 *       hvemErDu / vergeHarIkkeNorskFodselsnummerDNummer / borVergeINorge
 *       → representantopplysninger, fødselsnummer vs fødselsdato, norsk vs utenlandsk adresse
 *   - Dine opplysninger (dineOpplysninger): 4 same-panel / panel-level conditionals
 *       harSokerNorskFodselsnummerEllerDNummer / borSokerFastINorge
 *       → søker-fnr, adresse, telefon and downstream panel visibility
 *   - Boforhold (boforhold): 3 same-panel / panel-level conditionals
 *       delerSokerBoligMedEnAnnenVoksen / delerBoligMed / harSokerVaertInnlagtPaInstitusjonDeSisteTreManedene
 *       → spouse panels, innleggelse dates
 *   - Oppholdstillatelse (oppholdstillatelse): 4 same-panel conditionals
 *       harSokerOppholdstillatelseINorge / erDuNorskFraFodsel / varSokerNordiskStatsborgerVedFlyttingTilNorge
 *       → permit branch and EØS follow-up
 *   - Vedlegg (vedlegg): 3 cross-panel attachment conditionals
 *       erSokerEosBorgerEllerFamiliemedlemTilEosBorger → varigOppholdsbevisForEosBorgere
 *       delerBoligMed → kopiAvLikningsattestEllerSelvangivelseForSoker1
 *       eierSokerEgenBolig → dokumentasjonAvFormue
 */

const answerRadio = (label: string | RegExp, option: string) => {
  cy.findByLabelText(label)
    .closest('.form-group')
    .within(() => {
      cy.findByRole('radio', { name: option }).click();
    });
};

const visitHelpPanel = () => {
  cy.visit('/fyllut/nav642100/hjelpTilUtfyllingAvSoknaden?sub=paper');
  cy.defaultWaits();
};

const fillVergeRepresentativeMinimum = ({
  withoutFnr = false,
  livesInNorway = true,
}: {
  withoutFnr?: boolean;
  livesInNorway?: boolean;
} = {}) => {
  answerRadio('Hvem er du?', 'Verge for søker');

  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Verge');

  if (withoutFnr) {
    cy.findByRole('checkbox', { name: /Verge har ikke norsk fødselsnummer eller d-nummer/ }).click();
    cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1960');
  } else {
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
  }

  answerRadio('Bor verge i Norge?', livesInNorway ? 'Ja' : 'Nei');

  if (livesInNorway) {
    cy.findByRole('textbox', { name: 'Vegadresse' }).type('Vergeveien 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).type('0123');
    cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  } else {
    cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).type('Rue Test 1');
    cy.findByRole('textbox', { name: 'Postkode' }).type('75001');
    cy.findByRole('textbox', { name: 'By / stedsnavn' }).type('Paris');
    cy.findByRole('textbox', { name: 'Land' }).type('Frankrike');
  }

  cy.findByLabelText('Telefonnummer').type('12345678');
};

const fillApplicantForVisiblePanels = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).type('17912099997');
  answerRadio('Bor du fast i Norge?', 'Ja');
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Søkerveien 2');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0456');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByLabelText('Telefonnummer').type('12345678');
};

const openVisibleVergePanel = (panelTitle: string) => {
  visitHelpPanel();
  fillVergeRepresentativeMinimum();
  cy.clickNextStep();
  fillApplicantForVisiblePanels();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const openVergeFlowWithSpousePanels = (panelTitle: string) => {
  openVisibleVergePanel('Boforhold');
  answerRadio('Deler du bolig i Norge med noen over 18 år?', 'Ja');
  answerRadio('Hvem deler du bolig med?', 'Ektefelle/samboer/registrert partner');
  answerRadio('Har du vært innlagt på institusjon de siste tre månedene?', 'Nei');
  cy.findByRole('link', { name: panelTitle }).click();
};

const answerAttachmentLater = (name: RegExp) => {
  cy.findByRole('group', { name }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

describe('nav642100', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Hjelp til utfylling av søknaden conditionals', () => {
    beforeEach(() => {
      visitHelpPanel();
    });

    it('switches between representative identity and address branches for verge path', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      answerRadio('Hvem er du?', 'Jeg er søker/fullmektig for søker');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      answerRadio('Hvem er du?', 'Verge for søker');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');

      cy.findByRole('checkbox', { name: /Verge har ikke norsk fødselsnummer eller d-nummer/ }).click();
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');

      answerRadio('Bor verge i Norge?', 'Ja');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('not.exist');

      answerRadio('Bor verge i Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitHelpPanel();
      fillVergeRepresentativeMinimum();
      cy.clickNextStep();
    });

    it('shows applicant address and downstream panels only for the in-Norway fødselsnummer path', () => {
      cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByLabelText('Bor du fast i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByLabelText('Bor du fast i Norge?').should('exist');

      answerRadio('Bor du fast i Norge?', 'Ja');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppholdstillatelse' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByLabelText('Bor du fast i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Boforhold conditionals', () => {
    beforeEach(() => {
      openVisibleVergePanel('Boforhold');
    });

    it('toggles spouse panels and institution follow-up fields', () => {
      cy.findByLabelText('Hvem deler du bolig med?').should('not.exist');
      cy.findByRole('link', { name: 'Ektefelle/samboer/registrert partner' }).should('not.exist');

      answerRadio('Deler du bolig i Norge med noen over 18 år?', 'Ja');
      cy.findByLabelText('Hvem deler du bolig med?').should('exist');

      answerRadio('Hvem deler du bolig med?', 'Ektefelle/samboer/registrert partner');
      cy.findByRole('link', { name: 'Ektefelle/samboer/registrert partner' }).should('exist');
      cy.findByRole('link', { name: 'Ektefelles/samboers/registrert partners formue' }).should('exist');

      answerRadio('Hvem deler du bolig med?', 'Andre voksne');
      cy.findByRole('link', { name: 'Ektefelle/samboer/registrert partner' }).should('not.exist');
      cy.findByRole('link', { name: 'Ektefelles/samboers/registrert partners formue' }).should('not.exist');

      cy.findByRole('textbox', { name: /Dato for innleggelse/ }).should('not.exist');
      answerRadio('Har du vært innlagt på institusjon de siste tre månedene?', 'Ja');
      cy.findByRole('textbox', { name: /Dato for innleggelse/ }).should('exist');
      cy.findByLabelText('Er du fortsatt innlagt på institusjon?').should('exist');

      answerRadio('Er du fortsatt innlagt på institusjon?', 'Nei');
      cy.findByRole('textbox', { name: /Dato for utskrivelse/ }).should('exist');
    });
  });

  describe('Oppholdstillatelse conditionals', () => {
    beforeEach(() => {
      openVisibleVergePanel('Oppholdstillatelse');
    });

    it('toggles permit and citizenship follow-up questions', () => {
      cy.findByLabelText('Er din oppholdstillatelse permanent eller midlertidig?').should('not.exist');
      cy.findByLabelText('Var du nordisk statsborger ved flytting til Norge?').should('not.exist');
      cy.findByLabelText('Er du EØS-borger, eller familiemedlem til EØS-borger?').should('not.exist');

      answerRadio('Har du oppholdstillatelse i Norge?', 'Ja');
      cy.findByLabelText('Er din oppholdstillatelse permanent eller midlertidig?').should('exist');

      answerRadio('Har du oppholdstillatelse i Norge?', 'Nei');
      cy.findByLabelText('Er din oppholdstillatelse permanent eller midlertidig?').should('not.exist');

      answerRadio('Er du norsk statsborger?', 'Ja');
      answerRadio('Er du norsk fra fødsel?', 'Nei');
      cy.findByLabelText('Var du nordisk statsborger ved flytting til Norge?').should('exist');

      answerRadio('Var du nordisk statsborger ved flytting til Norge?', 'Nei');
      cy.findByLabelText('Er du EØS-borger, eller familiemedlem til EØS-borger?').should('exist');

      answerRadio('Var du nordisk statsborger ved flytting til Norge?', 'Ja');
      cy.findByLabelText('Er du EØS-borger, eller familiemedlem til EØS-borger?').should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows EØS attachment when applicant is an EØS citizen', () => {
      openVisibleVergePanel('Oppholdstillatelse');

      answerRadio('Har du oppholdstillatelse i Norge?', 'Nei');
      answerRadio(
        'Fikk du din første oppholdstillatelse på grunn av familiegjenforening med barn, barnebarn, niese eller nevø med plikt til å forsørge deg?',
        'Nei',
      );
      answerRadio('Er du norsk statsborger?', 'Ja');
      answerRadio('Er du norsk fra fødsel?', 'Nei');
      answerRadio('Var du nordisk statsborger ved flytting til Norge?', 'Nei');
      answerRadio('Er du EØS-borger, eller familiemedlem til EØS-borger?', 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av varig oppholdsbevis for EØS-borgere/ }).should('exist');
    });

    it('shows spouse tax attachment and applicant formue attachment for spouse and housing path', () => {
      openVergeFlowWithSpousePanels('Formue');

      answerRadio('Eier du egen bolig?', 'Ja');
      answerRadio('Bor du i boligen?', 'Ja');
      answerRadio('Eier du andre eiendommer i Norge eller utlandet?', 'Nei');
      answerRadio(/Eier du bil, campingvogn eller\s+andre kjøretøy\?/, 'Nei');
      answerRadio('Har du penger på konto/konti i Norge eller utlandet?', 'Nei');
      answerRadio('Har du aksjer, aksjefond eller verdipapirer i Norge eller utlandet?', 'Nei');
      answerRadio('Skylder noen deg mer enn 1000 kr?', 'Nei');
      answerRadio('Har du mer enn 1000 kr i kontanter?', 'Nei');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Kopi av siste skattemelding eller grunnlag for skatt fra siste hele kalenderår for ektefelle\/samboer\/ registrert partner/,
      }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av din formue/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av ektefelles\/samboers\/registrert partners formue/ }).should(
        'not.exist',
      );
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav642100/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('fills the verge flow and verifies the summary', () => {
      cy.findByRole('checkbox', {
        name: 'Veilederen har fortalt søkeren om hvilken informasjon vi henter og hvilken informasjon som søkeren selv må levere.',
      }).click();
      cy.clickNextStep();

      fillVergeRepresentativeMinimum();
      cy.clickNextStep();

      fillApplicantForVisiblePanels();
      cy.clickNextStep();

      answerRadio('Har du oppholdstillatelse i Norge?', 'Nei');
      answerRadio(
        'Fikk du din første oppholdstillatelse på grunn av familiegjenforening med barn, barnebarn, niese eller nevø med plikt til å forsørge deg?',
        'Nei',
      );
      answerRadio('Er du norsk statsborger?', 'Ja');
      answerRadio('Er du norsk fra fødsel?', 'Ja');
      cy.clickNextStep();

      answerRadio('Har du statsborgerskap i andre land enn Norge?', 'Nei');
      cy.clickNextStep();

      answerRadio('Deler du bolig i Norge med noen over 18 år?', 'Ja');
      answerRadio('Hvem deler du bolig med?', 'Ektefelle/samboer/registrert partner');
      answerRadio('Har du vært innlagt på institusjon de siste tre månedene?', 'Nei');
      cy.clickNextStep();

      answerRadio('Eier du egen bolig?', 'Ja');
      answerRadio('Bor du i boligen?', 'Ja');
      answerRadio('Eier du andre eiendommer i Norge eller utlandet?', 'Nei');
      answerRadio(/Eier du bil, campingvogn eller\s+andre kjøretøy\?/, 'Nei');
      answerRadio('Har du penger på konto/konti i Norge eller utlandet?', 'Nei');
      answerRadio('Har du aksjer, aksjefond eller verdipapirer i Norge eller utlandet?', 'Nei');
      answerRadio('Skylder noen deg mer enn 1000 kr?', 'Nei');
      answerRadio('Har du mer enn 1000 kr i kontanter?', 'Nei');
      cy.clickNextStep();

      answerRadio('Forventer du å ha arbeidsinntekt fremover?', 'Nei');
      answerRadio('Har du inntekter av kapital eller annen formue?', 'Nei');
      answerRadio('Har du andre ytelser i Nav?', 'Nei');
      answerRadio('Har du søkt om trygdeytelser som ikke er behandlet?', 'Nei');
      answerRadio(/Mottar du trygdeytelser og\/eller\s+pensjon i utlandet\?/, 'Nei');
      answerRadio(/Mottar du tjenestepensjon eller\s+pensjon som ikke er fra Nav\?/, 'Nei');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Partner');
      answerRadio('Har ektefelle/samboer/registrert partner norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', {
        name: /Ektefelles\/samboers\/registrert partners fødselsnummer eller d-nummer/i,
      }).type('17912099997');
      answerRadio('Er ektefelle/samboer/registrert partner bosatt i Norge?', 'Nei');
      cy.clickNextStep();

      answerRadio('Eier ektefelle/samboer/registrert partner egen bolig?', 'Nei');
      answerRadio('Har ektefelle/samboer/registrert partner depositumskonto/konti?', 'Nei');
      answerRadio('Eier ektefelle/samboer/registrert partner andre eiendommer i Norge eller utlandet?', 'Nei');
      answerRadio(/Eier ektefelle\/samboer\/registrert partner bil, campingvogn\s+eller andre kjøretøy\?/, 'Nei');
      answerRadio('Har ektefelle/samboer/registrert partner penger på konto/konti?', 'Nei');
      answerRadio(/Har\s+ektefelle\/samboer\/registrert partner aksjer, aksjefond og\/eller verdipapir\?/, 'Nei');
      answerRadio('Skylder noen ektefelle/samboer/registrert partner mer enn 1000 kroner?', 'Nei');
      answerRadio('Har ektefelle/samboer/registrert partner mer enn 1000 kroner i kontanter?', 'Nei');
      cy.clickNextStep();

      answerRadio(/Forventer ektefelle\/samboer\/registrert partner\s+å ha arbeidsinntekt fremover\?/, 'Nei');
      answerRadio('Har ektefelle/samboer/registrert partner inntekter av kapital eller annen formue?', 'Nei');
      answerRadio('Har ektefelle/samboer/registrert partner andre ytelser fra Nav?', 'Nei');
      answerRadio('Har ektefelle/samboer/registrert partner søkt om trygdeytelser som ikke er behandlet?', 'Nei');
      answerRadio(
        /Mottar ektefelle\/samboer\/registrert partner trygdeytelser og\/eller\s+pensjon i utlandet\?/,
        'Nei',
      );
      answerRadio(
        /Mottar ektefelle\/samboer\/registrert partner tjenestepensjon\s+eller pensjon som ikke er fra\s+Nav\?/,
        'Nei',
      );
      cy.clickNextStep();

      answerRadio('Har du reist til utlandet de siste 90 dager?', 'Nei');
      answerRadio('Har du planlagt å reise til utlandet i de neste 12 månedene?', 'Nei');
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: /Jeg har lest informasjonen om supplerende\s+stønad/ }).click();
      cy.findByRole('checkbox', {
        name: /Jeg er kjent med at Nav kan innhente de opplysningene som er nødvendige/,
      }).click();
      cy.clickNextStep();

      answerAttachmentLater(/Kopi av pass\/ID-papirer/);
      answerAttachmentLater(/Dokumentasjon av din formue/);
      answerAttachmentLater(/Kopi av din siste skattemelding eller grunnlag for skatt fra siste hele kalenderår/);
      answerAttachmentLater(
        /Kopi av siste skattemelding eller grunnlag for skatt fra siste hele kalenderår for ektefelle\/samboer\/ registrert partner/,
      );
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Hjelp til utfylling av søknaden', () => {
        cy.contains('dt', 'Hvem er du?').next('dd').should('contain.text', 'Verge for søker');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Boforhold', () => {
        cy.contains('dt', 'Hvem deler du bolig med?')
          .next('dd')
          .should('contain.text', 'Ektefelle/samboer/registrert partner');
      });
    });
  });
});
