/*
 * Production form tests for Søknad om refusjon av reiseutgifter knyttet til ortopediske hjelpemidler, parykk,
 * tilpasningskurs, folkehøyskole, grunnmønster eller brystprotese
 * Form: nav100716
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut skjemaet (hvemSomFyllerUtSkjemaet): 7 same-panel / panel-level conditionals
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → erDuOver18Ar, role field, guidance alerts
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → role-specific alerts
 *       erDuOver18Ar=nei → downstream panels hidden
 *   - Veiledning (veiledning): 1 same-panel conditional
 *       jegBekrefterAtJegVilSvareSaRiktigSomJegKan → alertstripe
 *   - Dine opplysninger (dineOpplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse and folkeregister alerts
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet
 *   - Formål (formal): 4 same-panel conditionals + 2 panel-level cross-panel triggers
 *       hvaErFormaletMedReisen → annet textfield, guidance, pårørende question
 *       harDuHattMedLedsagerPaReisen / harDuHattMedParorende... → downstream panel links
 *   - Reisemåte og utgifter (reisemateOgUtgifter): 37 grouped transport conditionals
 *       outbound selectboxes → amount / bil / drosje / annet fields
 *       same return path mirrors outbound selections
 *       different return path shows separate datagrid branches
 *   - Andre reiseutgifter (andreReiseutgifter): 8 same-panel/custom conditionals
 *       cost allowance, overnight stay, lost income, and ledsager income branches
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       onskerDuASendeInnRefusjonskrav... → datoerForReiser datagrid
 *   - Vedlegg (vedlegg): 7 cross-panel attachment conditionals
 *       role-based attachments + travel / overnight / income attachments
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
  visitWithFreshState(`/fyllut/nav100716/${panelKey}?sub=paper`);
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setCheckbox = (label: string | RegExp, checked: boolean) => {
  cy.findByRole('checkbox', { name: label }).then(($checkbox) => {
    if ($checkbox.is(':checked') !== checked) {
      cy.findByRole('checkbox', { name: label }).click();
    }
  });
};

const setTransportOption = (groupIndex: number, option: string, checked: boolean) => {
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
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillFormal = ({
  purpose = 'Ortopedisk hjelpemiddel',
  ledsager = 'Nei',
  parorende,
}: {
  purpose?: string;
  ledsager?: 'Ja' | 'Nei';
  parorende?: 'Ja' | 'Nei';
} = {}) => {
  selectRadio('Hva er formålet med reisen?', purpose);

  if (purpose === 'Annet') {
    cy.findByRole('textbox', { name: 'Oppgi annet formål for reisen' }).type('Annet testformål');
  }

  if (purpose === 'Tilpasningskurs' && parorende) {
    selectRadio(
      'Har du hatt med pårørende/andre nærstående som har deltatt på tilpasningskurs og som har hatt reiseutgifter til og fra kurset?',
      parorende,
    );
  }

  selectRadio('Ønsker du å få dekket reiseutgifter for ledsager?', ledsager);
  cy.findByRole('textbox', { name: /Avreisedato/ }).type('01.03.2025');
  cy.findByRole('textbox', { name: 'Tidspunkt for avreise (tt:mm)' }).type('10:00');
  cy.findByRole('textbox', { name: /Hjemkomstdato/ }).type('02.03.2025');
  cy.findByRole('textbox', { name: 'Tidspunkt for hjemkomst (tt:mm)' }).type('15:00');
  cy.findAllByRole('textbox', { name: 'Vegadresse' }).first().type('Testveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByRole('textbox', { name: 'Firmanavn' }).type('NAV Hjelpemiddelsentral');
  cy.findAllByRole('textbox', { name: 'Vegadresse' }).last().type('Kurssenterveien 2');
  cy.findByRole('textbox', { name: 'Kommune / by' }).type('Oslo');
};

const fillTransport = ({
  outbound = 'Buss / trikk / t-bane',
  sameReturn = 'Ja',
}: {
  outbound?: 'Buss / trikk / t-bane' | 'Bil';
  sameReturn?: 'Ja' | 'Nei';
} = {}) => {
  setTransportOption(0, outbound, true);

  if (outbound === 'Buss / trikk / t-bane') {
    cy.findByLabelText('Beløp for buss / trikk / t-bane').type('100');
  } else {
    cy.findByLabelText('Antall kilometer kjørt med bil').type('25');
    selectRadio('Har du benyttet bilferge?', 'Nei');
  }

  selectRadio('Brukte du samme reisemåte på returreisen?', sameReturn);

  if (sameReturn === 'Ja') {
    cy.findAllByLabelText('Beløp for buss / trikk / t-bane').last().type('100');
  } else {
    setTransportOption(1, 'Buss / trikk / t-bane', true);
    cy.findAllByLabelText('Beløp for buss / trikk / t-bane').last().type('100');
  }
};

const fillAndreReiseutgifter = ({
  kost = 'Nei',
  overnatting = 'Nei',
  taptArbeid = 'Nei',
}: {
  kost?: 'Ja' | 'Nei';
  overnatting?: 'Ja' | 'Nei';
  taptArbeid?: 'Ja' | 'Nei';
} = {}) => {
  selectRadio('Har du / dere vært på reise i mer enn 12 timer og søker kostgodtgjørelse?', kost);
  if (kost === 'Ja') {
    cy.findByLabelText('Hvor mange døgn søker du / dere kostgodtgjørelse for?').type('1');
  }

  selectRadio('Har du / dere hatt overnattingsutgifter?', overnatting);
  if (overnatting === 'Ja') {
    cy.findByLabelText('Hvor mange netter søker du / dere refusjon av overnattingsutgifter for?').type('1');
    cy.findByRole('textbox', { name: 'Oppgi navn og adresse på overnattingssted' }).type('Testhotell, Oslo');
  }

  selectRadio('Har du yrkesskade og hatt tapt arbeidsfortjeneste i forbindelse med reisen?', taptArbeid);
  if (taptArbeid === 'Ja') {
    cy.findByLabelText('Hvor mange timer søker du refusjon for tapt arbeidsinntekt?').type('2');
  }
};

const fillTilleggsopplysninger = (multipleTrips: 'Ja' | 'Nei' = 'Nei') => {
  selectRadio(
    'Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, med samme reisemåte og reiseutgifter?',
    multipleTrips,
  );

  if (multipleTrips === 'Ja') {
    cy.findByRole('textbox', { name: /Avreisedato/ }).type('05.03.2025');
    cy.findByRole('textbox', { name: 'Tidspunkt for avreise (tt:mm)' }).type('09:00');
    cy.findByRole('textbox', { name: /Hjemkomstdato/ }).type('05.03.2025');
    cy.findByRole('textbox', { name: 'Tidspunkt for hjemkomst (tt:mm)' }).last().type('12:00');
  }
};

const startSummaryFlow = () => {
  visitWithFreshState('/fyllut/nav100716?sub=paper');
  cy.get('body').then(($body) => {
    const title = $body.find('h2#page-title').text().trim();
    if (title !== 'Hvem som fyller ut skjemaet') {
      cy.clickNextStep();
    }
  });
  cy.get('h2#page-title').should('contain.text', 'Hvem som fyller ut skjemaet');
};

const goToVedleggWithTravelBranches = () => {
  startSummaryFlow();

  selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Ja');
  selectRadio('Hva er din rolle?', 'Jeg har fullmakt');
  cy.clickNextStep();

  setCheckbox('Jeg bekrefter at jeg vil svare så riktig som jeg kan.', true);
  cy.clickNextStep();

  fillApplicantWithFnr();
  cy.clickNextStep();

  fillFormal({ purpose: 'Tilpasningskurs', ledsager: 'Ja', parorende: 'Ja' });
  cy.clickNextStep();

  setTransportOption(0, 'Bil', true);
  cy.findByLabelText('Antall kilometer kjørt med bil').type('30');
  selectRadio('Har du benyttet bilferge?', 'Ja');
  cy.findByLabelText('Beløp for bilfergen').type('50');
  setTransportOption(0, 'Buss / trikk / t-bane', true);
  cy.findByLabelText('Beløp for buss / trikk / t-bane').type('75');
  selectRadio('Brukte du samme reisemåte på returreisen?', 'Nei');
  setTransportOption(1, 'Bil', true);
  cy.findAllByLabelText('Antall kilometer kjørt med bil').last().type('30');
  selectRadio('Har du benyttet bilferge?', 'Ja');
  cy.findAllByLabelText('Beløp for bilfergen').last().type('50');
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Andre reiseutgifter' }).click();

  fillAndreReiseutgifter({ kost: 'Ja', overnatting: 'Ja', taptArbeid: 'Ja' });
  selectRadio('Har ledsager hatt tapt arbeidsinntekt i forbindelse med reisen?', 'Ja');
  cy.findByLabelText('Hvor mange timer søker du refusjon for ledsagers tapte arbeidsinntekt?').type('3');
  cy.findByRole('link', { name: 'Opplysninger om ledsager' }).click();

  cy.findByRole('textbox', { name: 'Ledsagers fødselsdato (dd.mm.åååå)' }).type('01.01.1990');
  cy.findByRole('textbox', { name: 'Ledsagers fornavn' }).type('Lise');
  cy.findByRole('textbox', { name: 'Ledsagers etternavn' }).type('Ledsager');
  cy.findByRole('link', { name: /Opplysninger om pårørende/ }).click();

  cy.findByRole('textbox', { name: 'Pårørendes fødselsdato (dd.mm.åååå)' }).type('01.01.1985');
  cy.findByRole('textbox', { name: 'Pårørendes fornavn' }).type('Per');
  cy.findByRole('textbox', { name: 'Pårørendes etternavn' }).type('Parorende');
  cy.findByRole('textbox', { name: 'Pårørendes vegadresse' }).type('Pårørendeveien 3');
  cy.findByRole('textbox', { name: 'Pårørendes postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Pårørendes poststed' }).type('Oslo');
  cy.findByRole('link', { name: 'Tilleggsopplysninger' }).click();
  fillTilleggsopplysninger('Nei');
  cy.findByRole('link', { name: 'Vedlegg' }).click();
  cy.get('h2#page-title').should('contain.text', 'Vedlegg');
};

const goToSummaryFromVedlegg = () => {
  cy.clickNextStep();
  cy.get('body').then(($body) => {
    const title = $body.find('h2#page-title').text().trim();
    if (title === 'Erklæring fra søker') {
      cy.clickNextStep();
    }
  });
};

describe('nav100716', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Hvem som fyller ut skjemaet conditionals', () => {
    beforeEach(() => {
      visitPanel('hvemSomFyllerUtSkjemaet');
    });

    it('shows role field and paper-post alerts only when applying on behalf of someone else', () => {
      cy.findByLabelText('Er du over 18 år?').should('not.exist');
      cy.findByLabelText('Hva er din rolle?').should('not.exist');
      cy.contains('Du må sende søknaden i posten').should('not.exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen som du søker for').should('not.exist');

      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Ja');

      cy.findByLabelText('Hva er din rolle?').should('exist');
      cy.findByLabelText('Er du over 18 år?').should('not.exist');
      cy.contains('Du må sende søknaden i posten').should('exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen som du søker for').should('exist');

      selectRadio('Hva er din rolle?', 'Jeg har fullmakt');
      cy.contains(/Du må legge ved en .*fullmakt/i).should('exist');

      selectRadio('Hva er din rolle?', 'Jeg er verge');
      cy.contains('Du må legge ved dokumentasjon på at du er verge for den som søker.').should('exist');
      cy.contains(/Du må legge ved en .*fullmakt/i).should('not.exist');

      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Nei');

      cy.findByLabelText('Hva er din rolle?').should('not.exist');
      cy.contains('Du må sende søknaden i posten').should('not.exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen som du søker for').should('not.exist');
      cy.findByLabelText('Er du over 18 år?').should('exist');
    });

    it('hides downstream panels when the applicant is under 18 years old', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Veiledning' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');

      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Nei');
      selectRadio('Er du over 18 år?', 'Nei');

      cy.contains('En foresatt eller verge må sende søknaden for deg.').should('exist');
      selectRadio('Er du over 18 år?', 'Ja');
      cy.contains('En foresatt eller verge må sende søknaden for deg.').should('not.exist');
    });
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      visitPanel('veiledning');
    });

    it('shows the confirmation alert only when the declaration checkbox is checked', () => {
      cy.contains('Søknaden vil bli behandlet på grunnlag av innsendt dokumentasjon.').should('not.exist');

      setCheckbox('Jeg bekrefter at jeg vil svare så riktig som jeg kan.', true);
      cy.contains('Søknaden vil bli behandlet på grunnlag av innsendt dokumentasjon.').should('exist');

      setCheckbox('Jeg bekrefter at jeg vil svare så riktig som jeg kan.', false);
      cy.contains('Søknaden vil bli behandlet på grunnlag av innsendt dokumentasjon.').should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('switches between folkeregister guidance and address validity branches based on identity choices', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Formål conditionals', () => {
    beforeEach(() => {
      visitPanel('formal');
    });

    it('toggles purpose-specific textarea, guidance alerts and the tilpasningskurs question', () => {
      cy.findByRole('textbox', { name: 'Oppgi annet formål for reisen' }).should('not.exist');
      cy.findByLabelText(
        'Har du hatt med pårørende/andre nærstående som har deltatt på tilpasningskurs og som har hatt reiseutgifter til og fra kurset?',
      ).should('not.exist');

      selectRadio('Hva er formålet med reisen?', 'Annet');
      cy.findByRole('textbox', { name: 'Oppgi annet formål for reisen' }).should('exist');

      selectRadio('Hva er formålet med reisen?', 'Parykk');
      cy.contains('Reise dekkes kun ved anskaffelse av parykk.').should('exist');
      cy.findByRole('textbox', { name: 'Oppgi annet formål for reisen' }).should('not.exist');

      selectRadio('Hva er formålet med reisen?', 'Folkehøyskole');
      cy.contains('Reiseutgifter mellom skole og hjemmet dekkes kun ved skolestart og skoleslutt').should('exist');

      selectRadio('Hva er formålet med reisen?', 'Tilpasningskurs');
      cy.findByLabelText(
        'Har du hatt med pårørende/andre nærstående som har deltatt på tilpasningskurs og som har hatt reiseutgifter til og fra kurset?',
      ).should('exist');

      selectRadio('Hva er formålet med reisen?', 'Brystprotese');
      cy.findByLabelText(
        'Har du hatt med pårørende/andre nærstående som har deltatt på tilpasningskurs og som har hatt reiseutgifter til og fra kurset?',
      ).should('not.exist');
    });

    it('shows ledsager and pårørende panels only when the source answers require them', () => {
      fillFormal({ purpose: 'Tilpasningskurs', ledsager: 'Ja', parorende: 'Ja' });
      cy.clickShowAllSteps();

      cy.findByRole('link', { name: 'Opplysninger om ledsager' }).should('exist');
      cy.findByRole('link', { name: /Opplysninger om pårørende/ }).should('exist');

      selectRadio('Ønsker du å få dekket reiseutgifter for ledsager?', 'Nei');
      selectRadio(
        'Har du hatt med pårørende/andre nærstående som har deltatt på tilpasningskurs og som har hatt reiseutgifter til og fra kurset?',
        'Nei',
      );

      cy.findByRole('link', { name: 'Opplysninger om ledsager' }).should('not.exist');
      cy.findByRole('link', { name: /Opplysninger om pårørende/ }).should('not.exist');
    });
  });

  describe('Reisemåte og utgifter conditionals', () => {
    beforeEach(() => {
      visitPanel('reisemateOgUtgifter');
    });

    it('toggles outbound transport branches for bus, bil, drosje and other transport', () => {
      cy.findByLabelText('Beløp for buss / trikk / t-bane').should('not.exist');
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');
      cy.findByLabelText('Beløp for drosje').should('not.exist');
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('not.exist');

      setTransportOption(0, 'Buss / trikk / t-bane', true);
      cy.findByLabelText('Beløp for buss / trikk / t-bane').should('exist');

      setTransportOption(0, 'Bil', true);
      cy.findByLabelText('Antall kilometer kjørt med bil').should('exist');
      cy.findByLabelText('Har du benyttet bilferge?').should('exist');
      selectRadio('Har du benyttet bilferge?', 'Ja');
      cy.findByLabelText('Beløp for bilfergen').should('exist');

      setTransportOption(0, 'Drosje', true);
      cy.findByLabelText('Beløp for drosje').should('exist');
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('exist');

      setTransportOption(0, 'Annet transportmiddel', true);
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('exist');
      cy.findByLabelText('Beløp for annet transportmiddel').should('exist');

      setTransportOption(0, 'Bil', false);
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');
      cy.findByLabelText('Beløp for bilfergen').should('not.exist');
    });

    it('mirrors outbound selections when the return trip uses the same transport', () => {
      setTransportOption(0, 'Buss / trikk / t-bane', true);
      setTransportOption(0, 'Bil', true);
      cy.findByLabelText('Beløp for buss / trikk / t-bane').type('100');
      cy.findByLabelText('Antall kilometer kjørt med bil').type('25');
      selectRadio('Har du benyttet bilferge?', 'Nei');
      selectRadio('Brukte du samme reisemåte på returreisen?', 'Ja');

      cy.findAllByLabelText('Antall kilometer kjørt med bil').should('have.length', 2);
      cy.findAllByLabelText('Har du benyttet bilferge?').should('have.length', 2);
      cy.findAllByLabelText('Beløp for drosje').should('not.exist');

      setTransportOption(0, 'Bil', false);
      cy.findByLabelText('Antall kilometer kjørt med bil').should('not.exist');
    });

    it('shows a separate return transport datagrid when the return trip differs', () => {
      selectRadio('Brukte du samme reisemåte på returreisen?', 'Nei');
      cy.findAllByRole('group', { name: /Transportmiddel/ }).should('have.length', 2);

      setTransportOption(1, 'Drosje', true);
      cy.findByLabelText('Beløp for drosje').should('exist');
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte',
      }).should('exist');

      setTransportOption(1, 'Annet transportmiddel', true);
      cy.findByRole('textbox', { name: 'Spesifiser annet transportmiddel' }).should('exist');
      cy.findByLabelText('Beløp for annet transportmiddel').should('exist');
    });
  });

  describe('Andre reiseutgifter conditionals', () => {
    it('toggles reimbursement fields for cost allowance, overnight stay and lost work income', () => {
      visitPanel('andreReiseutgifter');

      cy.findByLabelText('Hvor mange døgn søker du / dere kostgodtgjørelse for?').should('not.exist');
      cy.findByLabelText('Hvor mange netter søker du / dere refusjon av overnattingsutgifter for?').should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi navn og adresse på overnattingssted' }).should('not.exist');
      cy.findByLabelText('Hvor mange timer søker du refusjon for tapt arbeidsinntekt?').should('not.exist');

      selectRadio('Har du / dere vært på reise i mer enn 12 timer og søker kostgodtgjørelse?', 'Ja');
      cy.findByLabelText('Hvor mange døgn søker du / dere kostgodtgjørelse for?').should('exist');

      selectRadio('Har du / dere hatt overnattingsutgifter?', 'Ja');
      cy.findByLabelText('Hvor mange netter søker du / dere refusjon av overnattingsutgifter for?').should('exist');
      cy.findByRole('textbox', { name: 'Oppgi navn og adresse på overnattingssted' }).should('exist');

      selectRadio('Har du yrkesskade og hatt tapt arbeidsfortjeneste i forbindelse med reisen?', 'Ja');
      cy.findByLabelText('Hvor mange timer søker du refusjon for tapt arbeidsinntekt?').should('exist');
    });

    it('shows ledsager lost-income fields only when ledsager was selected on the purpose panel', () => {
      visitPanel('formal');
      fillFormal({ purpose: 'Ortopedisk hjelpemiddel', ledsager: 'Ja' });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre reiseutgifter' }).click();

      cy.findByLabelText('Har ledsager hatt tapt arbeidsinntekt i forbindelse med reisen?').should('exist');

      selectRadio('Har ledsager hatt tapt arbeidsinntekt i forbindelse med reisen?', 'Ja');
      cy.findByLabelText('Hvor mange timer søker du refusjon for ledsagers tapte arbeidsinntekt?').should('exist');
    });
  });

  describe('Tilleggsopplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('tilleggsopplysninger');
    });

    it('shows the repeated-trips datagrid only when the applicant has more trips to claim', () => {
      cy.findByRole('textbox', { name: /Avreisedato/ }).should('not.exist');

      selectRadio(
        'Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, med samme reisemåte og reiseutgifter?',
        'Ja',
      );
      cy.findByRole('textbox', { name: /Avreisedato/ }).should('exist');

      selectRadio(
        'Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, med samme reisemåte og reiseutgifter?',
        'Nei',
      );
      cy.findByRole('textbox', { name: /Avreisedato/ }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows fullmakt and verge attachments only for the selected role', () => {
      visitPanel('hvemSomFyllerUtSkjemaet');
      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Ja');
      selectRadio('Hva er din rolle?', 'Jeg har fullmakt');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt|Generell fullmakt/ }).should('exist');
      cy.findByRole('group', { name: /verge/ }).should('not.exist');

      cy.findByRole('link', { name: 'Hvem som fyller ut skjemaet' }).click();
      selectRadio('Hva er din rolle?', 'Jeg er verge');
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt|Generell fullmakt/ }).should('not.exist');
      cy.findByRole('group', { name: /verge/ }).should('exist');
    });

    it('shows travel-related attachments when the triggering travel branches are selected', () => {
      goToVedleggWithTravelBranches();

      cy.findByRole('group', { name: /Fullmakt|Generell fullmakt/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på fergeutgifter|Dokumentasjon av reiseutgifter/ }).should('exist');
      cy.findByRole('group', { name: /Kvitteringer for transportutgifter|Dokumentasjon av reiseutgifter/ }).should(
        'exist',
      );
      cy.findByRole('group', { name: /hotell|overnatting|Dokumentasjon av utgifter/ }).should('exist');
      cy.findAllByRole('group', { name: /bortfall av inntekt/ }).should('have.length', 2);
      cy.findByRole('group', { name: /bortfall av inntekt for ledsager/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      startSummaryFlow();
    });

    it('fills required fields and verifies summary', () => {
      // Hvem som fyller ut skjemaet
      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Nei');
      selectRadio('Er du over 18 år?', 'Ja');
      cy.clickNextStep();

      // Veiledning
      setCheckbox('Jeg bekrefter at jeg vil svare så riktig som jeg kan.', true);
      cy.clickNextStep();

      // Dine opplysninger
      fillApplicantWithFnr();
      cy.clickNextStep();

      // Formål
      fillFormal({ purpose: 'Ortopedisk hjelpemiddel', ledsager: 'Nei' });
      cy.clickNextStep();

      // Reisemåte og utgifter
      fillTransport({ outbound: 'Buss / trikk / t-bane', sameReturn: 'Ja' });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre reiseutgifter' }).click();

      // Andre reiseutgifter
      fillAndreReiseutgifter({ kost: 'Nei', overnatting: 'Nei', taptArbeid: 'Nei' });
      cy.findByRole('link', { name: 'Tilleggsopplysninger' }).click();

      // Tilleggsopplysninger
      fillTilleggsopplysninger('Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg
      cy.findByRole('group', { name: /Oppmøtebekreftelse|Bekreftelse på oppmøte/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Kvitteringer for transportutgifter|Dokumentasjon av reiseutgifter/ }).within(
        () => {
          cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
        },
      );
      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });

      goToSummaryFromVedlegg();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Hvem som fyller ut skjemaet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fyller du ut søknaden på vegne av andre enn deg selv?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dd', 'Ola').should('exist');
      });
      cy.withinSummaryGroup('Formål', () => {
        cy.contains('dd', 'Ortopedisk hjelpemiddel').should('exist');
      });
    });
  });
});
