/*
 * Production form tests for Søknad om refusjon av reiseutgifter i forbindelse med bilstønadsordningen
 * Form: nav100717
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet, applicant alerts
 *   - Formål (formal): 1 same-panel conditional + 1 cross-panel panel conditional
 *       hvaErFormaletMedReisen → oppgiAnnetFormalForReisen
 *       onskerDuAFaDekketReiseutgifterForLedsager → panel opplysningerOmLedsager
 *   - Reisemåte og utgifter (reisemateOgUtgifter): grouped same-panel conditionals
 *       onskerDuAFaDekketReiseutgifterForLedsager → ledsager alert
 *       transportmiddelTur.transportmiddel → amount / bilferge / other transport branches
 *       brukteDuSammeReisematePaReturreisen → transportmiddelReturSamme / transportmiddelRetur
 *       transportmiddelRetur.transportmiddel → return amount / bilferge / other transport branches
 *   - Andre reiseutgifter (andreReiseutgifter): 7 same-panel conditionals
 *       overnight, cost compensation and lost-income branches
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       onskerDuASendeInnRefusjonskravForFlereReiserTilSammeBestemmelsesstedMenSammeReisemateOgReiseutgifter → datoerForReiser
 *   - Vedlegg (vedlegg): 5 cross-panel attachment conditionals
 *       bilferge / transport / overnatting / lost income branches
 */

const visitWithFreshState = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav100717/${panelKey}?sub=paper`);
};

const selectRadioOption = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const toggleTransportmiddel = ({
  groupIndex,
  option,
  checked = true,
}: {
  groupIndex: number;
  option: string;
  checked?: boolean;
}) => {
  cy.findAllByRole('group', { name: /Transportmiddel/ })
    .eq(groupIndex)
    .within(() => {
      if (checked) {
        cy.findByRole('checkbox', { name: option }).check();
      } else {
        cy.findByRole('checkbox', { name: option }).uncheck();
      }
    });
};

const fillApplicantWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadioOption('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillTravelBasics = () => {
  cy.findByRole('textbox', { name: /Avreisedato/ }).type('01.03.2025');
  cy.findByRole('textbox', { name: 'Tidspunkt for avreise (tt:mm)' }).type('09:00');
  cy.findByRole('textbox', { name: /Hjemkomstdato/ }).type('01.03.2025');
  cy.findByRole('textbox', { name: 'Tidspunkt for hjemkomst (tt:mm)' }).type('15:00');

  cy.findAllByRole('textbox', { name: 'Vegadresse' }).eq(0).type('Startveien 1');
  cy.findAllByRole('textbox', { name: 'Postnummer' }).eq(0).type('0150');
  cy.findAllByRole('textbox', { name: 'Poststed' }).eq(0).type('Oslo');

  cy.findAllByRole('textbox', { name: 'Vegadresse' }).eq(1).type('Målveien 2');
  cy.findAllByRole('textbox', { name: 'Postnummer' }).eq(1).type('5003');
  cy.findAllByRole('textbox', { name: 'Poststed' }).eq(1).type('Bergen');
};

const advancePastInformationalStart = () => {
  cy.get('h2#page-title').then(($title) => {
    if ($title.text().trim() === 'Introduksjon') {
      cy.clickNextStep();
    }
  });
  cy.get('h2#page-title').should('contain.text', 'Veiledning');
};

const selectRadioByText = (question: RegExp | string, option: string) => {
  cy.contains(question)
    .parents('fieldset')
    .first()
    .within(() => {
      cy.findByRole('radio', { name: option }).click();
    });
};

const fillMinimalReisemate = () => {
  toggleTransportmiddel({ groupIndex: 0, option: 'Buss / trikk / t-bane' });
  cy.findByLabelText(/Beløp for buss \/ trikk \/ t-bane/).type('100');

  selectRadioOption('Brukte du samme reisemåte på returreisen?', 'Ja');
  cy.findAllByLabelText(/Beløp for buss \/ trikk \/ t-bane/)
    .eq(1)
    .type('100');
};

const goToVedleggFromReisemate = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const answerVedleggMinimum = () => {
  cy.findByRole('group', { name: /Oppmøtebekreftelse/ }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
  cy.findByRole('group', { name: /Kvitteringer for transportutgifter|Dokumentasjon av reiseutgifter/ }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

describe('nav100717', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('shows manual address fields when applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadioOption('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadioOption('Bor du i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });

    it('shows folkeregister alert and hides address fields when applicant has Norwegian identity number', () => {
      selectRadioOption('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Formål conditionals', () => {
    beforeEach(() => {
      visitPanel('formal');
    });

    it('shows free-text purpose only when Annet is selected', () => {
      cy.findByRole('textbox', { name: /Oppgi annet formål.*reisen/ }).should('not.exist');

      selectRadioOption('Hva er formålet med reisen?', 'Annet');
      cy.findByRole('textbox', { name: /Oppgi annet formål.*reisen/ }).should('exist');

      selectRadioOption('Hva er formålet med reisen?', 'Utprøving');
      cy.findByRole('textbox', { name: /Oppgi annet formål.*reisen/ }).should('not.exist');
    });

    it('shows ledsager panel in the stepper only when ledsager expenses are requested', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om ledsager' }).should('not.exist');

      selectRadioOption('Ønsker du å få dekket reiseutgifter for ledsager?', 'Ja');
      cy.findByRole('link', { name: 'Opplysninger om ledsager' }).should('exist');
      cy.findByRole('link', { name: 'Reisemåte og utgifter' }).click();
      cy.contains('samlede utgifter for deg og ledsager').should('exist');

      cy.findByRole('link', { name: 'Formål' }).click();
      selectRadioOption('Ønsker du å få dekket reiseutgifter for ledsager?', 'Nei');
      cy.findByRole('link', { name: 'Opplysninger om ledsager' }).should('not.exist');
    });
  });

  describe('Reisemåte og utgifter conditionals', () => {
    beforeEach(() => {
      visitPanel('reisemateOgUtgifter');
    });

    it('toggles outbound transport branches', () => {
      cy.findByLabelText(/Beløp for buss \/ trikk \/ t-bane/).should('not.exist');
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');
      cy.findByLabelText('Har du benyttet bilferge?').should('not.exist');
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('not.exist');
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('not.exist');

      toggleTransportmiddel({ groupIndex: 0, option: 'Buss / trikk / t-bane' });
      cy.findByLabelText(/Beløp for buss \/ trikk \/ t-bane/).should('exist');
      toggleTransportmiddel({ groupIndex: 0, option: 'Buss / trikk / t-bane', checked: false });
      cy.findByLabelText(/Beløp for buss \/ trikk \/ t-bane/).should('not.exist');

      toggleTransportmiddel({ groupIndex: 0, option: 'Bil' });
      cy.findByLabelText('Antall kilometer kjørt med bil').should('exist');
      cy.findByLabelText('Har du benyttet bilferge?').should('exist');
      selectRadioOption('Har du benyttet bilferge?', 'Ja');
      cy.findByLabelText('Beløp for bilfergen').should('exist');
      selectRadioOption('Har du benyttet bilferge?', 'Nei');
      cy.findByLabelText('Beløp for bilfergen').should('not.exist');
      toggleTransportmiddel({ groupIndex: 0, option: 'Bil', checked: false });
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');

      toggleTransportmiddel({ groupIndex: 0, option: 'Annet transportmiddel' });
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('exist');
      cy.findByLabelText('Beløp for annet transportmiddel').should('exist');
      toggleTransportmiddel({ groupIndex: 0, option: 'Annet transportmiddel', checked: false });
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('not.exist');

      toggleTransportmiddel({ groupIndex: 0, option: 'Drosje' });
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('exist');
      toggleTransportmiddel({ groupIndex: 0, option: 'Drosje', checked: false });
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('not.exist');
    });

    it('switches between same-return and separate-return branches', () => {
      toggleTransportmiddel({ groupIndex: 0, option: 'Buss / trikk / t-bane' });

      cy.findAllByRole('group', { name: /Oppgi alle transportmiddel du brukte/ }).should('have.length', 1);
      cy.findAllByLabelText(/Beløp for buss \/ trikk \/ t-bane/).should('have.length', 1);

      selectRadioOption('Brukte du samme reisemåte på returreisen?', 'Ja');
      cy.findAllByLabelText(/Beløp for buss \/ trikk \/ t-bane/).should('have.length', 2);
      cy.findAllByRole('group', { name: /Oppgi alle transportmiddel du brukte/ }).should('have.length', 1);

      selectRadioOption('Brukte du samme reisemåte på returreisen?', 'Nei');
      cy.findAllByRole('group', { name: /Oppgi alle transportmiddel du brukte/ }).should('have.length', 2);
      cy.findAllByLabelText(/Beløp for buss \/ trikk \/ t-bane/).should('have.length', 1);
    });

    it('toggles separate return transport branches from the return datagrid', () => {
      selectRadioOption('Brukte du samme reisemåte på returreisen?', 'Nei');

      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('not.exist');
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('not.exist');

      toggleTransportmiddel({ groupIndex: 1, option: 'Bil' });
      cy.findByLabelText('Antall kilometer kjørt med bil').should('exist');
      selectRadioOption('Har du benyttet bilferge?', 'Ja');
      cy.findByLabelText('Beløp for bilfergen').should('exist');
      selectRadioOption('Har du benyttet bilferge?', 'Nei');
      cy.findByLabelText('Beløp for bilfergen').should('not.exist');
      toggleTransportmiddel({ groupIndex: 1, option: 'Bil', checked: false });
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');

      toggleTransportmiddel({ groupIndex: 1, option: 'Annet transportmiddel' });
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('exist');
      cy.findByLabelText('Beløp for annet transportmiddel').should('exist');
      toggleTransportmiddel({ groupIndex: 1, option: 'Annet transportmiddel', checked: false });
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('not.exist');

      toggleTransportmiddel({ groupIndex: 1, option: 'Drosje' });
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('exist');
      toggleTransportmiddel({ groupIndex: 1, option: 'Drosje', checked: false });
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('not.exist');
    });
  });

  describe('Andre reiseutgifter conditionals', () => {
    beforeEach(() => {
      visitPanel('andreReiseutgifter');
    });

    it('toggles reimbursement fields from the panel questions', () => {
      cy.findByLabelText('Hvor mange døgn søker du / dere kostgodtgjørelse for?').should('not.exist');
      cy.findByLabelText('Hvor mange netter søker du / dere refusjon av overnattingsutgifter for?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByLabelText('Hvor mange timer søker du refusjon for tapt arbeidsinntekt?').should('not.exist');

      selectRadioByText(/Har du eller dere vært på reise i mer enn 12 timer/, 'Ja');
      cy.findByLabelText('Hvor mange døgn søker du / dere kostgodtgjørelse for?').should('exist');

      selectRadioByText(/Har du\/dere hatt overnattingsutgifter/, 'Ja');
      cy.findByLabelText('Hvor mange netter søker du / dere refusjon av overnattingsutgifter for?').should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');

      selectRadioByText(/Har du yrkesskade og hatt tapt arbeidsfortjeneste/, 'Ja');
      cy.findByLabelText('Hvor mange timer søker du refusjon for tapt arbeidsinntekt?').should('exist');
    });

    it('shows ledsager lost-income questions when ledsager expenses were requested earlier', () => {
      visitPanel('formal');
      selectRadioOption('Hva er formålet med reisen?', 'Utprøving');
      selectRadioOption('Ønsker du å få dekket reiseutgifter for ledsager?', 'Ja');
      fillTravelBasics();
      cy.clickNextStep();
      fillMinimalReisemate();
      cy.clickNextStep();

      selectRadioByText(/Har ledsager hatt tapt arbeidsinntekt i forbindelse med reisen/, 'Ja');
      cy.findByLabelText('Hvor mange timer søker du refusjon for ledsagers tapte arbeidsinntekt?').should('exist');
    });
  });

  describe('Tilleggsopplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('tilleggsopplysninger');
    });

    it('shows additional trip dates only when user adds more identical trips', () => {
      cy.findByLabelText('Avreisedato (dd.mm.åååå)').should('not.exist');

      selectRadioOption(
        'Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, men samme reisemåte og reiseutgifter?',
        'Ja',
      );
      cy.findByLabelText('Avreisedato (dd.mm.åååå)').should('exist');

      selectRadioOption(
        'Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, men samme reisemåte og reiseutgifter?',
        'Nei',
      );
      cy.findByLabelText('Avreisedato (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      visitPanel('reisemateOgUtgifter');
    });

    it('shows ferry and transport attachments from selected travel methods', () => {
      toggleTransportmiddel({ groupIndex: 0, option: 'Bil' });
      cy.findByLabelText('Antall kilometer kjørt med bil').type('25');
      selectRadioOption('Har du benyttet bilferge?', 'Ja');
      cy.findByLabelText('Beløp for bilfergen').type('50');

      toggleTransportmiddel({ groupIndex: 0, option: 'Buss / trikk / t-bane' });
      cy.findByLabelText(/Beløp for buss \/ trikk \/ t-bane/).type('100');
      selectRadioOption('Brukte du samme reisemåte på returreisen?', 'Ja');
      cy.findAllByLabelText(/Beløp for buss \/ trikk \/ t-bane/)
        .eq(1)
        .type('100');

      goToVedleggFromReisemate();

      cy.findByRole('group', { name: /Dokumentasjon på fergeutgifter|Dokumentasjon av reiseutgifter/ }).should('exist');
      cy.findByRole('group', { name: /Kvitteringer for transportutgifter|Dokumentasjon av reiseutgifter/ }).should(
        'exist',
      );
    });

    it('shows overnight and income attachments from Andre reiseutgifter answers', () => {
      fillMinimalReisemate();
      cy.clickNextStep();

      selectRadioByText(/Har du eller dere vært på reise i mer enn 12 timer/, 'Nei');
      selectRadioByText(/Har du\/dere hatt overnattingsutgifter/, 'Ja');
      cy.findByLabelText('Hvor mange netter søker du / dere refusjon av overnattingsutgifter for?').type('1');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Hotellveien 3');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('5004');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Bergen');
      selectRadioByText(/Har du yrkesskade og hatt tapt arbeidsfortjeneste/, 'Ja');
      cy.findByLabelText('Hvor mange timer søker du refusjon for tapt arbeidsinntekt?').type('4');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kvittering for hotell \/ overnatting|Dokumentasjon av utgifter/ }).should(
        'exist',
      );
      cy.findByRole('group', {
        name: /Dokumentasjon fra arbeidsgiver på bortfall av inntekt|Dokumentasjon av inntekt/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav100717?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      advancePastInformationalStart();
      cy.findByRole('checkbox', {
        name: 'Jeg er kjent med at NAV kan innhente opplysninger som er nødvendige for å behandle søknaden.',
      }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg er kjent med at mangelfulle eller feilaktige opplysninger kan medføre krav om tilbakebetaling av feilutbetalt stønad.',
      }).click();
      cy.clickNextStep();

      fillApplicantWithFnr();
      cy.clickNextStep();

      selectRadioOption('Hva er formålet med reisen?', 'Utprøving');
      selectRadioOption('Ønsker du å få dekket reiseutgifter for ledsager?', 'Nei');
      fillTravelBasics();
      cy.clickNextStep();
      fillMinimalReisemate();
      cy.clickNextStep();

      selectRadioByText(/Har du eller dere vært på reise i mer enn 12 timer/, 'Nei');
      selectRadioByText(/Har du\/dere hatt overnattingsutgifter/, 'Nei');
      selectRadioByText(/Har du yrkesskade og hatt tapt arbeidsfortjeneste/, 'Nei');
      cy.clickNextStep();

      selectRadioOption(
        'Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, men samme reisemåte og reiseutgifter?',
        'Nei',
      );
      cy.clickNextStep();

      answerVedleggMinimum();
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Formål', () => {
        cy.contains('dt', 'Hva er formålet med reisen?').should('exist');
        cy.contains('dd', 'Utprøving').should('exist');
      });
      cy.withinSummaryGroup('Reisemåte og utgifter', () => {
        cy.contains('dt', 'Brukte du samme reisemåte på returreisen?').should('exist');
        cy.contains('dd', 'Ja').should('exist');
      });
    });
  });
});
