/*
 * Production form tests for Opplysninger om boet og kravene (Den statlige lønnsgarantiordning)
 * Form: nav670103
 * Submission types: none
 *
 * Panels tested:
 *   - Opplysninger om boet (opplysningeromboet): 2 same-panel conditionals
 *       harDetVaertGjennomfortForutgaendeRekonstruksjon → redegjor
 *       erKonkursrekvirentenEnArbeidstakerSomErFritattForAnsvarForBoomkostningerEtterKonkursloven73Jf67 → alertstripe1
 *   - Opphør av arbeidsforhold (opphoravarbeidsforhold): 5 same-panel conditionals
 *       harKonkursboetSagtOppDeAnsatte → konkursboetHarSagtOppDeAnsatte
 *       harNoenAvSokerneSagtOppEllerBlittSagtOppForKonkursapning → oppsigelse / blablabla
 *       varVirksomhetenInnstiltForKonkursapning → narBleVirksomhetenInnstilt / redegjor1
 *       haddeVirksomhetenTariffavtaleSomRegulererOppsigelsestid → redegjor2
 *       harNoenAvArbeidstakerneLengreOppsigelsestidEnnEnManedJfArbeidsmiljoloven1532Og3 → datagrid
 *   - Eierforhold (eierforhold): 1 row-scoped conditional
 *       erDetFremmetKravOmDekningForPerioderHvorArbeidstakerenHarEllerHarHattEierandelPa20EllerMer → redegjor
 *   - Lønnsgarantiloven § 7 (lonnsgarantiloven7): 9 same-panel conditionals
 *       radiopanel answers toggle Redegjør follow-up fields across all three sections
 *   - Forholdet til arbeidsmiljøloven kap. 16 (forholdettilarbeidsmiljolovenkap16): 1 same-panel conditional
 *       foreliggerDetOpplysningerSomKanTydePaAtHeleEllerDelerAvVirksomhetenErOverdrattTilEtAnnetRettssubjektForKonkursapning → takeover fields
 *   - Forholdet til dekningsloven § 7-11 (forholdettildekningsloven711): 3 same-panel conditionals
 *       harBoetSysselsattNoenAvSokerne → redegjor13
 *       harBoetTradtInnIArbeidsavtalene → inntreden / ikke-inntreden branches
 *       paHvilkeNMateRBleErklaeringenGitt → annet
 *   - Opplysninger om kravene (opplysningeromkravene): 4 same-panel conditionals
 *       radiopanel answers toggle Redegjør / Merknad fields
 *   - Overdragelse av krav (overdragelseavkrav): 1 same-panel conditional
 *       erKraveneTransportertEllerStiltSomSikkerhetJfLonnsgarantiloven17 → alertstripe2 / transfer fields
 *   - Fradrag for andre inntekter i søknadsperioden (fradragforandreinntekterisoknadsperioden): 2 same-panel conditionals
 *       harNoenAvSokerneHattAndreInntekterISoknadsperiodenSomErKommetIStedetForInntekterHosKonkursdebitor → redegjor19 / erDetGjortFradragForSlikeInntekter
 *       erDetGjortFradragForSlikeInntekter → redegjorNaermereForForholdet
 *   - Forholdet til andre ytelser i NAV (forholdettilandreytelserinav): 3 same-panel conditionals
 *       sykefravær / permittering / andre ytelser radiopanels reveal their datagrids
 *   - Krav fra arbeidstakere på skip o.l. (kravfraarbeidstakerepaskipol): 4 same-panel conditionals
 *       erNoenAvKraveneSjopantberettigede → ship follow-up fields
 *       erSjopantrettenGjortGjeldende → redegjor22
 *       erDetTattArrestISkipet → hvemHarTattArrestISkipet
 *   - Vurdering av kravene (vurderingavkravene): 2 same-panel conditionals
 *       harArbeidsgiverBekreftetKravene / innstillerBostyrerKraveneSomDekningsberettigede → Merknad
 */

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav670103/${panelKey}`);
  cy.defaultWaits();
};

const chooseRadio = (label: string, value: 'Ja' | 'Nei') => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const assertTextboxCount = (label: string | RegExp, count: number) => {
  cy.findAllByRole('textbox', { name: label }).should('have.length', count);
};

const assertButtonCount = (label: string | RegExp, count: number) => {
  cy.findAllByRole('button', { name: label }).should('have.length', count);
};

const fillOpplysningerOmBoet = () => {
  cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Testbo AS');
  cy.findByRole('textbox', { name: 'Virksomhetens organisasjonsnummer' }).type('889640782');
  cy.findByRole('textbox', { name: 'Konkursboets organisasjonsnummer' }).type('974760673');
  cy.findByRole('textbox', { name: 'Tingrettens navn' }).type('Oslo tingrett');
  cy.findByRole('textbox', { name: 'Bonummer' }).type('2025-001');
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Bobestyrer');
  cy.findByRole('textbox', { name: 'Postdresse' }).type('Testgata 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0123');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.findByLabelText('Boets kontonummer').type('01234567892');
  cy.findByRole('textbox', { name: 'Fristdag (dd.mm.åååå)' }).type('01.01.2025');
  cy.findByRole('textbox', { name: 'Konkursåpning (dd.mm.åååå)' }).type('15.01.2025');
  chooseRadio('Har det vært gjennomført forutgående rekonstruksjon?', 'Nei');
  chooseRadio(
    'Er konkursrekvirenten en arbeidstaker som er fritatt for ansvar for boomkostninger etter konkursloven § 73 jf. § 67?',
    'Nei',
  );
  chooseRadio('Er konkursboet innmeldt i merverdiavgiftsregisteret?', 'Nei');
  cy.clickNextStep();
};

const fillOpphorAvArbeidsforhold = () => {
  chooseRadio('Har konkursboet sagt opp de ansatte?', 'Nei');
  chooseRadio('Har noen av søkerne sagt opp eller blitt sagt opp før konkursåpning?', 'Nei');
  chooseRadio('Var virksomheten innstilt før konkursåpning?', 'Nei');
  chooseRadio('Hadde virksomheten tariffavtale som regulerer oppsigelsestid?', 'Nei');
  chooseRadio(
    'Har noen av arbeidstakerne lengre oppsigelsestid enn én måned, jf. arbeidsmiljøloven § 15-3 (2) og (3)?',
    'Nei',
  );
  cy.clickNextStep();
};

const fillEierforhold = () => {
  cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Ola');
  cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Eier');
  cy.findByLabelText('Eierandel i prosent').type('25');
  chooseRadio(
    'Er det fremmet krav om dekning for perioder hvor arbeidstakeren har eller har hatt eierandel på 20% eller mer?',
    'Nei',
  );
  cy.clickNextStep();
};

const fillLonnsgarantiloven7 = () => {
  chooseRadio('Har noen av søkerne fremmet krav fra og med arbeidsforholdets start?', 'Nei');
  chooseRadio(
    'Var arbeidsgiver i stand til å dekke de løpende lønnsforpliktelsene på tidspunktet for inngåelsen av arbeidsavtalen med søker?',
    'Ja',
  );
  chooseRadio(
    'Foreligger det opplysninger som tilsier at søkerne ikke var i aktsom god tro ved inngåelsen av arbeidsavtalen?',
    'Nei',
  );
  chooseRadio(
    'Har noen av søkerne fått lønnsgarantidekning etter konkurs i én eller flere virksomheter med samme eiere eller ledelse?',
    'Nei',
  );
  chooseRadio('Har noen av søkernes arbeidsavtaler blitt endret før konkursåpning?', 'Nei');
  chooseRadio(
    'Har noen av søkerne inngått ansettelsesforhold der forutsetningen har vært at krav helt eller delvis skal dekkes av lønnsgarantiordningen?',
    'Nei',
  );
  chooseRadio(
    'Foreligger det opplysninger som tilsier at noen av søkerne står i et slikt forhold til arbeidsgiver at dekning av kravet kan anses som urimelig?',
    'Nei',
  );
  cy.clickNextStep();
};

const fillForholdetTilArbeidsmiljoloven = () => {
  chooseRadio(
    'Foreligger det opplysninger som kan tyde på at hele eller deler av virksomheten er overdratt til et annet rettssubjekt før konkursåpning?',
    'Nei',
  );
  cy.clickNextStep();
};

const fillForholdetTilDekningsloven = () => {
  chooseRadio('Har boet sysselsatt noen av søkerne?', 'Nei');
  chooseRadio('Har boet trådt inn i arbeidsavtalene?', 'Ja');
  cy.clickNextStep();
};

const fillOpplysningerOmKravene = () => {
  chooseRadio('Har søkerne skriftlig bekreftet kravene sine, jf. lønnsgarantiforskriften § 3-1?', 'Ja');
  cy.findByRole('textbox', { name: 'Oppgi avtalt lønningsdato' }).type('Den 15. hver måned');
  cy.findByRole('textbox', { name: 'Utbetales lønnen forskudds- eller etterskuddsvis?' }).type('Etterskuddsvis');
  chooseRadio('Er det søkt dekket andre krav enn ordinær bruttolønn og/eller feriepenger?', 'Nei');
  chooseRadio('Er det søkt dekket feriepenger beregnet med en prosentsats som avviker fra ferieloven § 10 (2)?', 'Nei');
  chooseRadio('Har boet foretatt utbetalinger til noen av søkerne?', 'Nei');
  cy.clickNextStep();
};

const fillOverdragelseAvKrav = () => {
  chooseRadio('Er kravene transportert eller stilt som sikkerhet, jf. lønnsgarantiloven § 1 (7)?', 'Nei');
  cy.clickNextStep();
};

const fillFradragForAndreInntekter = () => {
  chooseRadio(
    'Har noen av søkerne hatt andre inntekter i søknadsperioden, som er kommet i stedet for inntekter hos konkursdebitor?',
    'Nei',
  );
  cy.clickNextStep();
};

const fillForholdetTilAndreYtelser = () => {
  chooseRadio('Har noen av søkerne hatt sykefravær utover arbeidsgiverperioden som kreves dekket?', 'Nei');
  chooseRadio('Har noen av søkerne vært permittert i søknadsperioden?', 'Nei');
  chooseRadio('Har noen av søkerne mottatt andre ytelser fra NAV i søknadsperioden?', 'Nei');
  cy.clickNextStep();
};

const fillKravFraArbeidstakerePaSkip = () => {
  chooseRadio('Er noen av kravene sjøpantberettigede?', 'Nei');
  cy.clickNextStep();
};

const fillVurderingAvKravene = () => {
  chooseRadio('Har arbeidsgiver bekreftet kravene?', 'Ja');
  chooseRadio('Innstiller bostyrer kravene som dekningsberettigede?', 'Ja');
  cy.clickNextStep();
};

describe('nav670103', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om boet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670103/opplysningeromboet');
      cy.findByRole('heading', { level: 2, name: 'Opplysninger om boet' }).should('exist');
    });

    it('toggles reconstruction remark and worker alertstripe', () => {
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');
      cy.contains('NAV dekker i disse tilfellene').should('not.exist');

      chooseRadio('Har det vært gjennomført forutgående rekonstruksjon?', 'Ja');
      cy.findByRole('textbox', { name: /Merknad:/ }).should('exist');

      chooseRadio('Har det vært gjennomført forutgående rekonstruksjon?', 'Nei');
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');

      chooseRadio(
        'Er konkursrekvirenten en arbeidstaker som er fritatt for ansvar for boomkostninger etter konkursloven § 73 jf. § 67?',
        'Ja',
      );
      cy.contains('NAV dekker i disse tilfellene').should('exist');

      chooseRadio(
        'Er konkursrekvirenten en arbeidstaker som er fritatt for ansvar for boomkostninger etter konkursloven § 73 jf. § 67?',
        'Nei',
      );
      cy.contains('NAV dekker i disse tilfellene').should('not.exist');
    });
  });

  describe('Opphør av arbeidsforhold conditionals', () => {
    beforeEach(() => {
      visitPanel('opphoravarbeidsforhold');
    });

    it('toggles same-panel datagrids and textareas across all branches', () => {
      assertButtonCount('Legg til flere datoer', 0);
      cy.findByRole('textbox', { name: 'Når hadde søker siste arbeidsdag? (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Når ble virksomheten innstilt?' }).should('not.exist');
      assertButtonCount('Legg til flere arbeidstakere', 0);
      assertTextboxCount(/Merknad:/, 0);

      chooseRadio('Har konkursboet sagt opp de ansatte?', 'Ja');
      assertButtonCount('Legg til flere datoer', 1);

      chooseRadio('Har konkursboet sagt opp de ansatte?', 'Nei');
      assertButtonCount('Legg til flere datoer', 0);

      chooseRadio('Har noen av søkerne sagt opp eller blitt sagt opp før konkursåpning?', 'Ja');
      cy.findByRole('textbox', { name: 'Når hadde søker siste arbeidsdag? (dd.mm.åååå)' }).should('exist');
      assertButtonCount('Legg til flere datoer', 2);

      chooseRadio('Har noen av søkerne sagt opp eller blitt sagt opp før konkursåpning?', 'Nei');
      cy.findByRole('textbox', { name: 'Når hadde søker siste arbeidsdag? (dd.mm.åååå)' }).should('not.exist');
      assertButtonCount('Legg til flere datoer', 0);

      chooseRadio('Var virksomheten innstilt før konkursåpning?', 'Ja');
      cy.findByRole('textbox', { name: 'Når ble virksomheten innstilt?' }).should('exist');
      assertTextboxCount(/Merknad:/, 1);

      chooseRadio('Var virksomheten innstilt før konkursåpning?', 'Nei');
      cy.findByRole('textbox', { name: 'Når ble virksomheten innstilt?' }).should('not.exist');
      assertTextboxCount(/Merknad:/, 0);

      chooseRadio('Hadde virksomheten tariffavtale som regulerer oppsigelsestid?', 'Ja');
      assertTextboxCount(/Merknad:/, 1);

      chooseRadio('Hadde virksomheten tariffavtale som regulerer oppsigelsestid?', 'Nei');
      assertTextboxCount(/Merknad:/, 0);

      chooseRadio(
        'Har noen av arbeidstakerne lengre oppsigelsestid enn én måned, jf. arbeidsmiljøloven § 15-3 (2) og (3)?',
        'Ja',
      );
      assertButtonCount('Legg til flere arbeidstakere', 1);

      chooseRadio(
        'Har noen av arbeidstakerne lengre oppsigelsestid enn én måned, jf. arbeidsmiljøloven § 15-3 (2) og (3)?',
        'Nei',
      );
      assertButtonCount('Legg til flere arbeidstakere', 0);
    });
  });

  describe('Eierforhold conditionals', () => {
    beforeEach(() => {
      visitPanel('eierforhold');
    });

    it('toggles the row-scoped remark field inside the ownership datagrid', () => {
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');

      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Ola');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Eier');
      cy.findByLabelText('Eierandel i prosent').type('25');
      chooseRadio(
        'Er det fremmet krav om dekning for perioder hvor arbeidstakeren har eller har hatt eierandel på 20% eller mer?',
        'Ja',
      );
      cy.findByRole('textbox', { name: /Merknad:/ }).should('exist');

      chooseRadio(
        'Er det fremmet krav om dekning for perioder hvor arbeidstakeren har eller har hatt eierandel på 20% eller mer?',
        'Nei',
      );
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');
    });
  });

  describe('Lønnsgarantiloven § 7 conditionals', () => {
    beforeEach(() => {
      visitPanel('lonnsgarantiloven7');
    });

    it('toggles Redegjør follow-up fields across all branches', () => {
      assertTextboxCount(/Redegjør:/, 0);
      cy.findByLabelText(
        'Var forutsetningen for denne endringen at krav etter endringen helt eller delvis skal dekkes av lønnsgarantiordningen?',
      ).should('not.exist');
      cy.findByLabelText(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende forutsetningen for denne endringen?',
      ).should('not.exist');
      cy.findByLabelText(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende denne/disse forutsetningen(e)?',
      ).should('not.exist');

      chooseRadio('Har noen av søkerne fremmet krav fra og med arbeidsforholdets start?', 'Ja');
      assertTextboxCount(/Redegjør:/, 1);
      chooseRadio('Har noen av søkerne fremmet krav fra og med arbeidsforholdets start?', 'Nei');
      assertTextboxCount(/Redegjør:/, 0);

      chooseRadio(
        'Var arbeidsgiver i stand til å dekke de løpende lønnsforpliktelsene på tidspunktet for inngåelsen av arbeidsavtalen med søker?',
        'Nei',
      );
      assertTextboxCount(/Redegjør:/, 1);
      chooseRadio(
        'Var arbeidsgiver i stand til å dekke de løpende lønnsforpliktelsene på tidspunktet for inngåelsen av arbeidsavtalen med søker?',
        'Ja',
      );
      assertTextboxCount(/Redegjør:/, 0);

      chooseRadio(
        'Foreligger det opplysninger som tilsier at søkerne ikke var i aktsom god tro ved inngåelsen av arbeidsavtalen?',
        'Ja',
      );
      assertTextboxCount(/Redegjør:/, 1);
      chooseRadio(
        'Foreligger det opplysninger som tilsier at søkerne ikke var i aktsom god tro ved inngåelsen av arbeidsavtalen?',
        'Nei',
      );
      assertTextboxCount(/Redegjør:/, 0);

      chooseRadio(
        'Har noen av søkerne fått lønnsgarantidekning etter konkurs i én eller flere virksomheter med samme eiere eller ledelse?',
        'Ja',
      );
      assertTextboxCount(/Redegjør:/, 1);
      chooseRadio(
        'Har noen av søkerne fått lønnsgarantidekning etter konkurs i én eller flere virksomheter med samme eiere eller ledelse?',
        'Nei',
      );
      assertTextboxCount(/Redegjør:/, 0);

      chooseRadio('Har noen av søkernes arbeidsavtaler blitt endret før konkursåpning?', 'Ja');
      cy.findByLabelText(
        'Var forutsetningen for denne endringen at krav etter endringen helt eller delvis skal dekkes av lønnsgarantiordningen?',
      ).should('exist');
      assertTextboxCount(/Redegjør:/, 1);

      chooseRadio(
        'Var forutsetningen for denne endringen at krav etter endringen helt eller delvis skal dekkes av lønnsgarantiordningen?',
        'Ja',
      );
      cy.findByLabelText(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende forutsetningen for denne endringen?',
      ).should('exist');
      assertTextboxCount(/Redegjør:/, 2);

      chooseRadio(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende forutsetningen for denne endringen?',
        'Ja',
      );
      assertTextboxCount(/Redegjør:/, 3);

      chooseRadio('Har noen av søkernes arbeidsavtaler blitt endret før konkursåpning?', 'Nei');
      cy.findByLabelText(
        'Var forutsetningen for denne endringen at krav etter endringen helt eller delvis skal dekkes av lønnsgarantiordningen?',
      ).should('not.exist');
      cy.findByLabelText(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende forutsetningen for denne endringen?',
      ).should('not.exist');
      assertTextboxCount(/Redegjør:/, 0);

      chooseRadio(
        'Har noen av søkerne inngått ansettelsesforhold der forutsetningen har vært at krav helt eller delvis skal dekkes av lønnsgarantiordningen?',
        'Ja',
      );
      cy.findByLabelText(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende denne/disse forutsetningen(e)?',
      ).should('exist');
      assertTextboxCount(/Redegjør:/, 1);

      chooseRadio(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende denne/disse forutsetningen(e)?',
        'Ja',
      );
      assertTextboxCount(/Redegjør:/, 2);

      chooseRadio(
        'Har noen av søkerne inngått ansettelsesforhold der forutsetningen har vært at krav helt eller delvis skal dekkes av lønnsgarantiordningen?',
        'Nei',
      );
      cy.findByLabelText(
        'Foreligger det opplysninger som tilsier at søker ikke var i aktsom god tro vedrørende denne/disse forutsetningen(e)?',
      ).should('not.exist');
      assertTextboxCount(/Redegjør:/, 0);

      chooseRadio(
        'Foreligger det opplysninger som tilsier at noen av søkerne står i et slikt forhold til arbeidsgiver at dekning av kravet kan anses som urimelig?',
        'Ja',
      );
      assertTextboxCount(/Redegjør:/, 1);

      chooseRadio(
        'Foreligger det opplysninger som tilsier at noen av søkerne står i et slikt forhold til arbeidsgiver at dekning av kravet kan anses som urimelig?',
        'Nei',
      );
      assertTextboxCount(/Redegjør:/, 0);
    });
  });

  describe('Forholdet til arbeidsmiljøloven kap. 16 conditionals', () => {
    beforeEach(() => {
      visitPanel('forholdettilarbeidsmiljolovenkap16');
    });

    it('shows and hides takeover follow-up fields', () => {
      cy.findByRole('textbox', { name: 'Oppgi navn på overtakende virksomhet' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Dato for overdragelsen (dd.mm.åååå)' }).should('not.exist');
      assertButtonCount('Legg til flere arbeidstakere', 0);
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');

      chooseRadio(
        'Foreligger det opplysninger som kan tyde på at hele eller deler av virksomheten er overdratt til et annet rettssubjekt før konkursåpning?',
        'Ja',
      );
      cy.findByRole('textbox', { name: 'Oppgi navn på overtakende virksomhet' }).should('exist');
      cy.findByRole('textbox', { name: 'Dato for overdragelsen (dd.mm.åååå)' }).should('exist');
      assertButtonCount('Legg til flere arbeidstakere', 1);
      cy.findByRole('textbox', { name: /Merknad:/ }).should('exist');

      chooseRadio(
        'Foreligger det opplysninger som kan tyde på at hele eller deler av virksomheten er overdratt til et annet rettssubjekt før konkursåpning?',
        'Nei',
      );
      cy.findByRole('textbox', { name: 'Oppgi navn på overtakende virksomhet' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Dato for overdragelsen (dd.mm.åååå)' }).should('not.exist');
      assertButtonCount('Legg til flere arbeidstakere', 0);
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');
    });
  });

  describe('Forholdet til dekningsloven § 7-11 conditionals', () => {
    beforeEach(() => {
      visitPanel('forholdettildekningsloven711');
    });

    it('toggles sysselsatt, inntreden and declaration follow-up fields', () => {
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Oppgi dato for uttreden/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Oppgi dato for erklæring om ikke-inntreden/ }).should('not.exist');
      cy.findByRole('group', { name: /På hvilke\(n\) måte\(r\) ble erklæringen gitt\?/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Annet:' }).should('not.exist');

      chooseRadio('Har boet sysselsatt noen av søkerne?', 'Ja');
      cy.findByRole('textbox', { name: /Merknad:/ }).should('exist');
      chooseRadio('Har boet sysselsatt noen av søkerne?', 'Nei');
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');

      chooseRadio('Har boet trådt inn i arbeidsavtalene?', 'Ja');
      cy.findByRole('textbox', { name: /Oppgi dato for uttreden/ }).should('exist');
      assertTextboxCount(/Redegjør:/, 1);
      cy.findByRole('textbox', { name: /Oppgi dato for erklæring om ikke-inntreden/ }).should('not.exist');

      chooseRadio('Har boet trådt inn i arbeidsavtalene?', 'Nei');
      cy.findByRole('textbox', { name: /Oppgi dato for uttreden/ }).should('not.exist');
      assertTextboxCount(/Redegjør:/, 0);
      cy.findByRole('textbox', { name: /Oppgi dato for erklæring om ikke-inntreden/ }).should('exist');
      cy.findByRole('group', { name: /På hvilke\(n\) måte\(r\) ble erklæringen gitt\?/ }).should('exist');

      cy.findByRole('group', { name: /På hvilke\(n\) måte\(r\) ble erklæringen gitt\?/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).check();
      });
      cy.findByRole('textbox', { name: 'Annet:' }).should('exist');

      cy.findByRole('group', { name: /På hvilke\(n\) måte\(r\) ble erklæringen gitt\?/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Annet:' }).should('not.exist');
    });
  });

  describe('Opplysninger om kravene conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningeromkravene');
    });

    it('toggles Redegjør and Merknad follow-up fields', () => {
      cy.findByRole('textbox', { name: /Redegjør:/ }).should('not.exist');
      assertTextboxCount(/Merknad:/, 0);

      chooseRadio('Har søkerne skriftlig bekreftet kravene sine, jf. lønnsgarantiforskriften § 3-1?', 'Nei');
      cy.findByRole('textbox', { name: /Redegjør:/ }).should('exist');
      chooseRadio('Har søkerne skriftlig bekreftet kravene sine, jf. lønnsgarantiforskriften § 3-1?', 'Ja');
      cy.findByRole('textbox', { name: /Redegjør:/ }).should('not.exist');

      chooseRadio('Er det søkt dekket andre krav enn ordinær bruttolønn og/eller feriepenger?', 'Ja');
      assertTextboxCount(/Merknad:/, 1);
      chooseRadio(
        'Er det søkt dekket feriepenger beregnet med en prosentsats som avviker fra ferieloven § 10 (2)?',
        'Ja',
      );
      assertTextboxCount(/Merknad:/, 2);
      chooseRadio('Har boet foretatt utbetalinger til noen av søkerne?', 'Ja');
      assertTextboxCount(/Merknad:/, 3);

      chooseRadio('Er det søkt dekket andre krav enn ordinær bruttolønn og/eller feriepenger?', 'Nei');
      chooseRadio(
        'Er det søkt dekket feriepenger beregnet med en prosentsats som avviker fra ferieloven § 10 (2)?',
        'Nei',
      );
      chooseRadio('Har boet foretatt utbetalinger til noen av søkerne?', 'Nei');
      assertTextboxCount(/Merknad:/, 0);
    });
  });

  describe('Overdragelse av krav conditionals', () => {
    beforeEach(() => {
      visitPanel('overdragelseavkrav');
    });

    it('shows alertstripe and transfer fields when claims are assigned', () => {
      cy.contains('NAV kan kreve at kopi av transporterklæringen oversendes').should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi tidspunkt for overdragelse (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Ny fordringshaver' }).should('not.exist');

      chooseRadio('Er kravene transportert eller stilt som sikkerhet, jf. lønnsgarantiloven § 1 (7)?', 'Ja');
      cy.contains('NAV kan kreve at kopi av transporterklæringen oversendes').should('exist');
      cy.findByRole('textbox', { name: 'Oppgi tidspunkt for overdragelse (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Ny fordringshaver' }).should('exist');

      chooseRadio('Er kravene transportert eller stilt som sikkerhet, jf. lønnsgarantiloven § 1 (7)?', 'Nei');
      cy.contains('NAV kan kreve at kopi av transporterklæringen oversendes').should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi tidspunkt for overdragelse (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Ny fordringshaver' }).should('not.exist');
    });
  });

  describe('Fradrag for andre inntekter conditionals', () => {
    beforeEach(() => {
      visitPanel('fradragforandreinntekterisoknadsperioden');
    });

    it('toggles nested deduction follow-up fields', () => {
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');
      cy.findByLabelText('Er det gjort fradrag for slike inntekter?').should('not.exist');
      cy.findByRole('textbox', { name: /Redegjør for årsaken til at det ikke er gjort fradrag/ }).should('not.exist');

      chooseRadio(
        'Har noen av søkerne hatt andre inntekter i søknadsperioden, som er kommet i stedet for inntekter hos konkursdebitor?',
        'Ja',
      );
      cy.findByRole('textbox', { name: /Merknad:/ }).should('exist');
      cy.findByLabelText('Er det gjort fradrag for slike inntekter?').should('exist');

      chooseRadio('Er det gjort fradrag for slike inntekter?', 'Nei');
      cy.findByRole('textbox', { name: /Redegjør for årsaken til at det ikke er gjort fradrag/ }).should('exist');

      chooseRadio('Er det gjort fradrag for slike inntekter?', 'Ja');
      cy.findByRole('textbox', { name: /Redegjør for årsaken til at det ikke er gjort fradrag/ }).should('not.exist');

      chooseRadio(
        'Har noen av søkerne hatt andre inntekter i søknadsperioden, som er kommet i stedet for inntekter hos konkursdebitor?',
        'Nei',
      );
      cy.findByRole('textbox', { name: /Merknad:/ }).should('not.exist');
      cy.findByLabelText('Er det gjort fradrag for slike inntekter?').should('not.exist');
    });
  });

  describe('Forholdet til andre ytelser i NAV conditionals', () => {
    beforeEach(() => {
      visitPanel('forholdettilandreytelserinav');
    });

    it('toggles all three conditional datagrids', () => {
      cy.findByRole('textbox', { name: 'Første fraværsdag (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Dato for permittering (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Ytelse' }).should('not.exist');

      chooseRadio('Har noen av søkerne hatt sykefravær utover arbeidsgiverperioden som kreves dekket?', 'Ja');
      cy.findByRole('textbox', { name: 'Første fraværsdag (dd.mm.åååå)' }).should('exist');
      chooseRadio('Har noen av søkerne hatt sykefravær utover arbeidsgiverperioden som kreves dekket?', 'Nei');
      cy.findByRole('textbox', { name: 'Første fraværsdag (dd.mm.åååå)' }).should('not.exist');

      chooseRadio('Har noen av søkerne vært permittert i søknadsperioden?', 'Ja');
      cy.findByRole('textbox', { name: 'Dato for permittering (dd.mm.åååå)' }).should('exist');
      chooseRadio('Har noen av søkerne vært permittert i søknadsperioden?', 'Nei');
      cy.findByRole('textbox', { name: 'Dato for permittering (dd.mm.åååå)' }).should('not.exist');

      chooseRadio('Har noen av søkerne mottatt andre ytelser fra NAV i søknadsperioden?', 'Ja');
      cy.findByRole('textbox', { name: 'Ytelse' }).should('exist');
      chooseRadio('Har noen av søkerne mottatt andre ytelser fra NAV i søknadsperioden?', 'Nei');
      cy.findByRole('textbox', { name: 'Ytelse' }).should('not.exist');
    });
  });

  describe('Krav fra arbeidstakere på skip o.l. conditionals', () => {
    beforeEach(() => {
      visitPanel('kravfraarbeidstakerepaskipol');
    });

    it('toggles ship-related follow-up fields and nested arrest question', () => {
      cy.findByRole('textbox', { name: 'Hvem eier skipet?' }).should('not.exist');
      cy.findByLabelText('Er sjøpantretten gjort gjeldende?').should('not.exist');
      cy.findByLabelText('Er det tatt arrest i skipet?').should('not.exist');
      cy.findByRole('textbox', { name: 'Hvem har tatt arrest i skipet?' }).should('not.exist');
      assertTextboxCount(/Merknad:/, 0);

      chooseRadio('Er noen av kravene sjøpantberettigede?', 'Ja');
      cy.findByRole('textbox', { name: 'Hvem eier skipet?' }).should('exist');
      cy.findByLabelText('Er sjøpantretten gjort gjeldende?').should('exist');
      cy.findByLabelText('Er det tatt arrest i skipet?').should('exist');
      assertTextboxCount(/Merknad:/, 1);

      chooseRadio('Er sjøpantretten gjort gjeldende?', 'Nei');
      assertTextboxCount(/Merknad:/, 2);
      chooseRadio('Er sjøpantretten gjort gjeldende?', 'Ja');
      assertTextboxCount(/Merknad:/, 1);

      chooseRadio('Er det tatt arrest i skipet?', 'Ja');
      cy.findByRole('textbox', { name: 'Hvem har tatt arrest i skipet?' }).should('exist');
      chooseRadio('Er det tatt arrest i skipet?', 'Nei');
      cy.findByRole('textbox', { name: 'Hvem har tatt arrest i skipet?' }).should('not.exist');

      chooseRadio('Er noen av kravene sjøpantberettigede?', 'Nei');
      cy.findByRole('textbox', { name: 'Hvem eier skipet?' }).should('not.exist');
      cy.findByLabelText('Er sjøpantretten gjort gjeldende?').should('not.exist');
      cy.findByLabelText('Er det tatt arrest i skipet?').should('not.exist');
      assertTextboxCount(/Merknad:/, 0);
    });
  });

  describe('Vurdering av kravene conditionals', () => {
    beforeEach(() => {
      visitPanel('vurderingavkravene');
    });

    it('toggles both Merknad follow-up fields', () => {
      assertTextboxCount(/Merknad:/, 0);

      chooseRadio('Har arbeidsgiver bekreftet kravene?', 'Nei');
      assertTextboxCount(/Merknad:/, 1);

      chooseRadio('Innstiller bostyrer kravene som dekningsberettigede?', 'Nei');
      assertTextboxCount(/Merknad:/, 2);

      chooseRadio('Har arbeidsgiver bekreftet kravene?', 'Ja');
      chooseRadio('Innstiller bostyrer kravene som dekningsberettigede?', 'Ja');
      assertTextboxCount(/Merknad:/, 0);
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670103/veiledning');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      cy.clickNextStep();

      // Opplysninger om boet
      fillOpplysningerOmBoet();

      // Opphør av arbeidsforhold
      fillOpphorAvArbeidsforhold();

      // Eierforhold
      fillEierforhold();

      // Lønnsgarantiloven § 7
      fillLonnsgarantiloven7();

      // Forholdet til arbeidsmiljøloven kap. 16
      fillForholdetTilArbeidsmiljoloven();

      // Forholdet til dekningsloven § 7-11
      fillForholdetTilDekningsloven();

      // Opplysninger om kravene
      fillOpplysningerOmKravene();

      // Overdragelse av krav
      fillOverdragelseAvKrav();

      // Fradrag for andre inntekter i søknadsperioden
      fillFradragForAndreInntekter();

      // Forholdet til andre ytelser i NAV
      fillForholdetTilAndreYtelser();

      // Krav fra arbeidstakere på skip o.l.
      fillKravFraArbeidstakerePaSkip();

      // Vurdering av kravene
      fillVurderingAvKravene();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om boet', () => {
        cy.contains('dt', 'Virksomhetens navn').next('dd').should('contain.text', 'Testbo AS');
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Eierforhold', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Eierandel i prosent').next('dd').should('contain.text', '25');
      });
      cy.withinSummaryGroup('Vurdering av kravene', () => {
        cy.contains('dt', 'Har arbeidsgiver bekreftet kravene?').next('dd').should('contain.text', 'Ja');
        cy.contains('dt', 'Innstiller bostyrer kravene som dekningsberettigede?')
          .next('dd')
          .should('contain.text', 'Ja');
      });
    });
  });
});
