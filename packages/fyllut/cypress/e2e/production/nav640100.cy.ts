/*
 * Production form tests for Supplerende stønad til ufør flyktning
 * Form: nav640100
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Søknaden (soknaden): guardian-only conditionals and role-driven panel visibility
 *       hvilkenFunksjonRepresentererDu → verge fields / Dine opplysninger visibility
 *       vergeHarIkkeNorskFodselsnummerDNummer → guardian fødselsdato / fnr toggle
 *       harIkkeTelefon → guardian phone visibility
 *   - Dine opplysninger (dineOpplysninger): applicant identity and downstream panel visibility
 *       harSokerNorskFodselsnummerEllerDNummer → søkers fnr / address / Oppholdstillatelse panel
 *       borSokerFastINorge → address fields
 *   - Boforhold (boforhold): spouse-path panel visibility
 *       hvemDelerSokerBoligMed → spouse info, formue and income panels
 *   - Vedlegg (vedlegg): cross-panel attachment conditionals
 *       applicant formue answers → Dokumentasjon av din formue
 *       spouse path + spouse formue / foreign pension answers → spouse attachments
 */

const formPath = 'nav640100';
const paperPath = (suffix = '') => `/fyllut/${formPath}${suffix}?sub=paper`;

const waitForPageTitle = (title: string) => {
  cy.get('#page-title').should('contain.text', title);
};

const ensureAllStepsShown = () => {
  cy.get('body').then(($body) => {
    const showButtons = $body
      .find('button')
      .toArray()
      .filter((button) => /Vis alle steg|Show all steps/.test(button.textContent?.trim() ?? ''));

    if (showButtons.length > 0) {
      cy.contains('button', /Vis alle steg|Show all steps/).click();
      cy.contains('button', /Skjul alle steg|Hide all steps/).should('exist');
    }
  });
};

const selectRole = (
  option: 'Verge for søker' | 'Veileder på søkers Nav-kontor' | 'Jeg er søker/fullmektig for søker',
) => {
  cy.withinComponent('Hvem er du?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const fillGuardianApplicationPanel = () => {
  selectRole('Verge for søker');
  cy.withinComponent('Har du fått svar på søknad om uføretrygd?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Er du registrert som flyktning etter utlendingsloven § 28?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Vera');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Verge');
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.findByRole('checkbox', {
    name: /Jeg som søker er kjent med at Nav kan innhente de opplysningene som er nødvendige for å avgjøre kravet/i,
  }).click();
};

const fillApplicantDetailsWithNorwegianId = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).type('17912099997');
  cy.withinComponent('Bor du fast i Norge?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByLabelText('Telefonnummer').type('12345678');
};

const fillOppholdstillatelseMinimal = () => {
  cy.withinComponent('Er du norsk statsborger?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
};

const fillAndreStatsborgerskapMinimal = () => {
  cy.withinComponent('Har du statsborgerskap i andre land enn Norge?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillBoforholdWithoutSpouse = () => {
  cy.withinComponent('Deler du bolig med noen over 18 år?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du vært innlagt på institusjon de siste tre månedene?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillApplicantFormueNo = () => {
  cy.withinComponent('Eier du egen bolig?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du depositumkonto/konti?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(/Eier du andre eiendommer i\s+Norge eller utlandet\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(/Eier du bil, campingvogn eller\s+andre kjøretøy\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du penger på konto/konti i Norge eller utlandet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du aksjer, aksjefond eller verdipapirer i Norge eller utlandet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Skylder noen deg mer enn 1000 kr?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du mer enn 1000 kr i kontanter?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillApplicantFormueForAttachment = () => {
  cy.withinComponent('Eier du egen bolig?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Bor du i boligen?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent(/Eier du andre eiendommer i\s+Norge eller utlandet\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(/Eier du bil, campingvogn eller\s+andre kjøretøy\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du penger på konto/konti i Norge eller utlandet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du aksjer, aksjefond eller verdipapirer i Norge eller utlandet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Skylder noen deg mer enn 1000 kr?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du mer enn 1000 kr i kontanter?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillApplicantInntektNo = () => {
  cy.withinComponent('Forventer du å ha arbeidsinntekt fremover?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du inntekter av kapital eller annen formue?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du andre ytelser i Nav?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du søkt om trygdeytelser som ikke er behandlet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Mottar du trygdeytelser og/eller pensjon i utlandet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(/Mottar du tjenestepensjon eller\s+pensjon som ikke er fra Nav\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillUtenlandsoppholdNo = () => {
  cy.withinComponent('Har du reist til utlandet de siste 90 dager?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du planlagt å reise til utlandet i de neste 12 månedene?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const goToSoknadenFromRoot = () => {
  cy.visit(paperPath());
  cy.defaultWaits();

  cy.get('body').then(($body) => {
    if ($body.find('#page-title').text().trim() !== 'Veiledning') {
      cy.clickNextStep();
    }
  });

  waitForPageTitle('Veiledning');
  cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
  cy.clickNextStep();
  waitForPageTitle('Søknaden');
};

const startGuardianFlowAtSoknaden = () => {
  goToSoknadenFromRoot();
  fillGuardianApplicationPanel();
};

const goToDineOpplysninger = () => {
  startGuardianFlowAtSoknaden();
  ensureAllStepsShown();
  cy.findByRole('link', { name: 'Dine opplysninger' }).click();
  waitForPageTitle('Dine opplysninger');
};

const goToBoforhold = () => {
  goToDineOpplysninger();
  fillApplicantDetailsWithNorwegianId();
  cy.clickNextStep();
  waitForPageTitle('Oppholdstillatelse');
  fillOppholdstillatelseMinimal();
  cy.clickNextStep();
  waitForPageTitle('Andre statsborgerskap');
  fillAndreStatsborgerskapMinimal();
  cy.clickNextStep();
  waitForPageTitle('Boforhold');
};

const goToFormue = () => {
  goToBoforhold();
  fillBoforholdWithoutSpouse();
  cy.clickNextStep();
  waitForPageTitle('Formue');
};

const fillSpouseDetails = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Sara');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Samboer');
  cy.withinComponent('Har ektefelle/samboer/registrert partner norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', {
    name: /Ektefelles\/samboers\/registrert partners\s+fødselsnummer eller d-nummer/i,
  }).type('17912099997');
  cy.withinComponent('Er ektefelle/samboer/registrert partner bosatt i Norge?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Er ektefelle/samboer/registrert partner ufør flyktning?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillSpouseFormueForAttachment = () => {
  cy.withinComponent('Eier ektefelle/samboer/registrert partner egen bolig?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Bor ektefelle/samboer/registrert partner i boligen?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent(/Eier ektefelle\/samboer\/registrert partner andre eiendommer i Norge eller utlandet\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(/Eier ektefelle\/samboer\/registrert partner bil, campingvogn\s+eller andre kjøretøy\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har ektefelle/samboer/registrert partner penger på konto/konti?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(/Har\s+ektefelle\/samboer\/registrert partner aksjer, aksjefond og\/eller verdipapir\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Skylder noen ektefelle/samboer/registrert partner mer enn 1000 kroner?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har ektefelle/samboer/registrert partner mer enn 1000 kroner i kontanter?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const fillSpouseIncomeForAttachment = () => {
  cy.withinComponent(/Forventer ektefelle\/samboer\/registrert partner\s+å ha arbeidsinntekt fremover\?/, () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har ektefelle/samboer/registrert partner inntekter av kapital eller annen formue?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har ektefelle/samboer/registrert partner andre ytelser fra Nav?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har ektefelle/samboer/registrert partner søkt om trygdeytelser som ikke er behandlet?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent(
    /Mottar ektefelle\/samboer\/registrert partner trygdeytelser og\/eller\s+pensjon i utlandet\?/,
    () => {
      cy.findByRole('radio', { name: 'Ja' }).click();
    },
  );
  cy.findByRole('textbox', { name: 'Oppgi trygdeytelse/ pensjon i utlandet' }).type('Pensjon');
  cy.findByLabelText('Oppgi beløp per måned i lokal valuta').type('1000');
  cy.findByRole('textbox', { name: 'Valuta' }).type('EUR');
  cy.withinComponent(
    /Mottar ektefelle\/samboer\/registrert partner tjenestepensjon\s+eller pensjon som ikke er fra\s+Nav\?/,
    () => {
      cy.findByRole('radio', { name: 'Nei' }).click();
    },
  );
};

const chooseEttersender = (groupLabel: RegExp) => {
  cy.findByRole('group', { name: groupLabel }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

describe('nav640100', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Søknaden conditionals', () => {
    beforeEach(() => {
      cy.visit(paperPath('/soknaden'));
      waitForPageTitle('Søknaden');
    });

    it('toggles guardian-only fields, phone inputs and Dine opplysninger visibility from role selection', () => {
      selectRole('Verge for søker');
      cy.findByRole('checkbox', { name: /Verge har ikke norsk fødselsnummer eller d-nummer/ }).should('exist');
      cy.findByRole('checkbox', {
        name: /Jeg som søker er kjent med at Nav kan innhente de opplysningene som er nødvendige for å avgjøre kravet/i,
      }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('exist');

      cy.findByRole('checkbox', { name: /Verge har ikke norsk fødselsnummer eller d-nummer/ }).click();
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('exist');

      cy.findByRole('checkbox', { name: /Verge har ikke norsk fødselsnummer eller d-nummer/ }).click();
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Fødselsdato/ }).should('not.exist');

      cy.get('input[type="tel"]').should('exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.get('input[type="tel"]').should('not.exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.get('input[type="tel"]').should('exist');

      ensureAllStepsShown();
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');

      selectRole('Veileder på søkers Nav-kontor');
      cy.findByRole('checkbox', { name: /Verge har ikke norsk fødselsnummer eller d-nummer/ }).should('not.exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      goToDineOpplysninger();
    });

    it('shows applicant identity fields, address and later panels only on the norwegian-id branch', () => {
      cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByLabelText('Bor du fast i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByLabelText('Bor du fast i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Ditt fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByLabelText('Bor du fast i Norge?').should('exist');

      cy.withinComponent('Bor du fast i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
    });
  });

  describe('Boforhold panel visibility', () => {
    beforeEach(() => {
      goToBoforhold();
    });

    it('shows spouse panels only when applicant lives with spouse or registered partner', () => {
      cy.withinComponent('Deler du bolig med noen over 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hvem deler du bolig med?', () => {
        cy.findByRole('radio', { name: 'Ektefelle / samboer / registrert partner' }).click();
      });
      cy.withinComponent('Har du vært innlagt på institusjon de siste tre månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickNextStep();
      waitForPageTitle('Formue');
      fillApplicantFormueNo();
      cy.clickNextStep();
      waitForPageTitle('Inntekt');
      fillApplicantInntektNo();
      cy.clickNextStep();
      waitForPageTitle('Opplysninger om ektefelle/ samboer/ registrert partner');

      cy.clickPreviousStep();
      waitForPageTitle('Inntekt');
      cy.clickPreviousStep();
      waitForPageTitle('Formue');
      cy.clickPreviousStep();
      waitForPageTitle('Boforhold');

      cy.withinComponent('Hvem deler du bolig med?', () => {
        cy.findByRole('radio', { name: 'Voksne barn' }).click();
      });
      cy.clickNextStep();
      waitForPageTitle('Formue');
      fillApplicantFormueNo();
      cy.clickNextStep();
      waitForPageTitle('Inntekt');
      fillApplicantInntektNo();
      cy.clickNextStep();
      waitForPageTitle('Utenlandsopphold');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows applicant formue attachment when applicant owns a home', () => {
      goToFormue();

      fillApplicantFormueForAttachment();
      cy.clickNextStep();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av (din )?formue/ }).should('exist');
    });

    it('shows spouse attachments for spouse-specific asset and pension branches', () => {
      goToBoforhold();

      cy.withinComponent('Deler du bolig med noen over 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hvem deler du bolig med?', () => {
        cy.findByRole('radio', { name: 'Ektefelle / samboer / registrert partner' }).click();
      });
      cy.withinComponent('Har du vært innlagt på institusjon de siste tre månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();
      waitForPageTitle('Formue');

      fillApplicantFormueNo();
      cy.clickNextStep();
      waitForPageTitle('Inntekt');
      fillApplicantInntektNo();
      cy.clickNextStep();
      waitForPageTitle('Opplysninger om ektefelle/ samboer/ registrert partner');

      fillSpouseDetails();
      cy.clickNextStep();

      fillSpouseFormueForAttachment();
      cy.clickNextStep();

      fillSpouseIncomeForAttachment();
      cy.clickNextStep();
      waitForPageTitle('Utenlandsopphold');
      fillUtenlandsoppholdNo();
      cy.clickNextStep();
      cy.findByRole('checkbox', {
        name: /Jeg som søker har lest informasjonen om supplerende stønad/i,
      }).click();
      cy.clickNextStep();
      waitForPageTitle('Vedlegg');

      cy.findByRole('group', { name: /ektefelles\/samboers\/registrert partners formue/i }).should('exist');
      cy.findByRole('group', {
        name: /skattemelding eller grunnlag for skatt fra siste hele kalenderår for ektefelle/i,
      }).should('exist');
      cy.findByRole('group', { name: /trygdeytelser og\/eller pensjon i utlandet for ektefelle/i }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit(paperPath());
      cy.defaultWaits();
    });

    it('fills the guardian happy path and verifies the summary', () => {
      cy.get('body').then(($body) => {
        if ($body.find('#page-title').text().trim() !== 'Veiledning') {
          cy.clickNextStep();
        }
      });
      waitForPageTitle('Veiledning');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      fillGuardianApplicationPanel();
      ensureAllStepsShown();
      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
      waitForPageTitle('Dine opplysninger');

      fillApplicantDetailsWithNorwegianId();
      cy.clickNextStep();

      fillOppholdstillatelseMinimal();
      cy.clickNextStep();

      fillAndreStatsborgerskapMinimal();
      cy.clickNextStep();

      fillBoforholdWithoutSpouse();
      cy.clickNextStep();

      fillApplicantFormueNo();
      cy.clickNextStep();

      fillApplicantInntektNo();
      cy.clickNextStep();

      fillUtenlandsoppholdNo();
      cy.clickNextStep();

      cy.findByRole('checkbox', {
        name: /Jeg som søker har lest informasjonen om supplerende stønad/i,
      }).click();
      cy.clickNextStep();

      chooseEttersender(/Kopi av pass\/ID-papirer/);
      chooseEttersender(/Kopi av din siste skattemelding eller grunnlag for skatt fra siste hele kalenderår/);
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.contains('dt', 'Hvem er du?').next('dd').should('contain.text', 'Verge for søker');
      cy.contains('dt', 'Bor du fast i Norge?').next('dd').should('contain.text', 'Ja');
      cy.contains('dt', 'Deler du bolig med noen over 18 år?').next('dd').should('contain.text', 'Nei');
    });
  });
});
