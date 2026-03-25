import productionForm from '../../../../../mocks/mocks/data/forms-api/production-forms/nav100714.json';

/*
 * Production form tests for Søknad om briller til forebygging eller behandling av amblyopi
 * Form: nav100714
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): 1 same-panel conditional
 *       kryssAvDersomDuAlleredeHarEnUtfyltSoknadSomDuKunSkalHenteUtForstesideForInnsendingTil → erDuOptikerEllerOyelege
 *   - Søkers opplysninger (sokersOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresse.borDuINorge → adresseVarighet
 *   - Søknad (soknad): 9 same-panel conditionals
 *       varSoker10ArEllerEldre → erSoker18ArEllerEldre
 *       erSoker18ArEllerEldre → telefonnummer
 *       detSokesOmStonadTil → underpunktForNyeBrillerHerTrengsEnLedetekst, hvaErArsakenTilBytteAvGlass and alertstripes
 *       hvaErArsakenTilBytteAvGlass → alertstripes
 *   - Brille-/linseseddel (brilleLinseseddel): 6 conditional branches
 *       varSoker10ArEllerEldre → ordinære/særskilte guidance
 *       visusErIkkeMuligAMale → textarea instead of visus fields
 *       erDetPavistManifestStrabisme → type manifest strabisme
 *       erDetForetattTidligereVisusmalinger → tidligereVisusmalinger datagrid
 *       vilkarsutregning.individueltBelop → stønadsalert + pristilbud attachment
 *   - Kontaktlinser (kontaktlinser): 1 cross-panel conditional
 *       detSokesOmStonadTil=kontaktlinser → beskrivMedisinskArsak and kvitteringForKontaktlinser
 *   - Vedlegg (vedlegg): 4 cross-panel conditionals
 *       detSokesOmStonadTil → conditional attachments
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
  visitWithFreshState(`/fyllut/nav100714/${panelKey}?sub=paper`);
};

const visitRoot = () => {
  visitWithFreshState('/fyllut/nav100714?sub=paper');
};

const selectRadioOption = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const chooseSupportType = (option: string) => {
  selectRadioOption('Det søkes om stønad til', option);
};

const fillApplicantWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadioOption('Har søker norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillBrilleLinseseddel = ({
  sphere = '0.00',
  noVisus = false,
  previousMeasurements = 'nei',
}: {
  sphere?: string;
  noVisus?: boolean;
  previousMeasurements?: 'ja' | 'nei';
} = {}) => {
  cy.findByRole('textbox', { name: /Dato for synsundersøkelse/ }).type('01.03.2025');

  cy.findAllByLabelText('Sfære (SPH)').eq(0).select(sphere);
  cy.findAllByLabelText('Sylinder (CYL)').eq(0).select('0.00');
  cy.findAllByLabelText('ADD').eq(0).select('0.00');

  cy.findAllByLabelText('Sfære (SPH)').eq(1).select(sphere);
  cy.findAllByLabelText('Sylinder (CYL)').eq(1).select('0.00');
  cy.findAllByLabelText('ADD').eq(1).select('0.00');

  if (noVisus) {
    cy.findByRole('checkbox', { name: /Det er ikke mulig å oppgi visus nå/ }).click();
    cy.findByRole('textbox', { name: 'Hvorfor er det ikke mulig å oppgi visus?' }).type(
      'Søker samarbeider ikke om målingen akkurat nå.',
    );
  } else {
    cy.findAllByRole('textbox', { name: 'Visus med gitt korreksjon' }).eq(0).type('0,5');
    cy.findAllByRole('textbox', { name: 'Visus med gitt korreksjon' }).eq(1).type('0,6');
  }

  selectRadioOption('Er det foretatt visusmålinger tidligere?', previousMeasurements === 'ja' ? 'Ja' : 'Nei');

  if (previousMeasurements === 'ja') {
    cy.findByRole('textbox', { name: 'Måledato (dd.mm.åååå)' }).type('01.02.2025');
    cy.findByRole('textbox', { name: 'Høyre øye' }).type('0,4');
    cy.findByRole('textbox', { name: 'Venstre øye' }).type('0,3');
  }

  cy.findByRole('textbox', {
    name: /Søknaden skal vurderes etter særskilte vilkår/i,
  }).type('Det er fortsatt behov for behandling for å forebygge amblyopi.');
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

const advancePastIntroduksjon = () => {
  cy.get('h2#page-title').then(($title) => {
    if ($title.text().trim() === 'Introduksjon') {
      cy.clickNextStep();
    }
  });
  cy.get('h2#page-title').should('contain.text', 'Veiledning');
};

const fillVeiledningAndApplicant = () => {
  advancePastIntroduksjon();
  selectRadioOption('Er du optiker eller øyelege?', 'Optiker');
  cy.clickNextStep();
  fillApplicantWithFnr();
  cy.clickNextStep();
};

describe('nav100714', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav100714*', { body: productionForm }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav100714', { body: { 'nb-NO': {} } }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/nb-NO', { body: { 'nb-NO': {} } });
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      visitPanel('veiledning');
    });

    it('hides optiker/øyelege question when first-page-only checkbox is selected', () => {
      cy.findByLabelText('Er du optiker eller øyelege?').should('exist');

      cy.findByRole('checkbox', {
        name: /Kryss av dersom du allerede har en utfylt søknad/,
      }).click();
      cy.findByLabelText('Er du optiker eller øyelege?').should('not.exist');

      cy.findByRole('checkbox', {
        name: /Kryss av dersom du allerede har en utfylt søknad/,
      }).click();
      cy.findByLabelText('Er du optiker eller øyelege?').should('exist');
    });
  });

  describe('Søkers opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('sokersOpplysninger');
    });

    it('shows address fields when søker has no Norwegian identity number', () => {
      cy.findByLabelText('Bor søker i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadioOption('Har søker norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor søker i Norge?').should('exist');

      selectRadioOption('Bor søker i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });
  });

  describe('Søknad conditionals', () => {
    beforeEach(() => {
      visitPanel('soknad');
    });

    it('toggles age, phone and støtte-specific branches', () => {
      cy.findByLabelText('Er søker 18 år eller eldre?').should('not.exist');
      cy.findByLabelText('Telefonnummer').should('not.exist');
      cy.findByLabelText('Hva er årsaken til behovet for nye komplette briller?').should('not.exist');
      cy.findByLabelText('Hva er årsaken til bytte av glass?').should('not.exist');

      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      cy.findByLabelText('Er søker 18 år eller eldre?').should('exist');

      selectRadioOption('Er søker 18 år eller eldre?', 'Ja');
      cy.findByLabelText('Telefonnummer').should('exist');

      selectRadioOption('Er søker 18 år eller eldre?', 'Nei');
      cy.findByLabelText('Telefonnummer').should('not.exist');

      chooseSupportType('Nye komplette briller eller bytte av to glass');
      cy.findByLabelText('Hva er årsaken til behovet for nye komplette briller?').should('exist');

      selectRadioOption('Hva er årsaken til behovet for nye komplette briller?', 'Endring i brillestyrke');
      cy.contains('Det må være behov for bytte av begge glassene').should('exist');

      selectRadioOption('Hva er årsaken til behovet for nye komplette briller?', 'Brillen er ødelagt');
      cy.contains('Nye komplette briller dekkes i tilfeller hvor begge glassene er ødelagte').should('exist');

      chooseSupportType('Bytte av ett glass');
      cy.findByLabelText('Hva er årsaken til behovet for nye komplette briller?').should('not.exist');
      cy.findByLabelText('Hva er årsaken til bytte av glass?').should('exist');
      cy.contains('Søknad må sendes før det har gått seks måneder etter at glasset ble byttet').should('exist');

      selectRadioOption('Hva er årsaken til bytte av glass?', 'Glasset er ødelagt');
      cy.contains('I tilfeller hvor begge glassene er ødelagte').should('exist');

      selectRadioOption('Hva er årsaken til bytte av glass?', 'Endring i brillestyrke');
      cy.contains('Bytte av ett glass forutsetter en endring i brillestyrke').should('exist');

      chooseSupportType('Reparasjon/bytte av innfatning');
      cy.contains('Stønad til reparasjon eller bytte av innfatning er begrenset').should('exist');
      cy.findByLabelText('Hva er årsaken til bytte av glass?').should('not.exist');

      chooseSupportType('Kontaktlinser');
      cy.contains('Dersom det foreligger en medisinsk årsak til at en person ikke kan bruke briller').should('exist');
    });
  });

  describe('Brille-/linseseddel conditionals', () => {
    beforeEach(() => {
      visitPanel('soknad');
      chooseSupportType('Nye komplette briller eller bytte av to glass');
      cy.clickShowAllSteps();
    });

    it('switches between ordinære and særskilte branches based on søker age', () => {
      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      cy.findByRole('link', { name: 'Brille-/linseseddel' }).click();

      cy.contains('Du søker om stønad for en person som er 10 år eller eldre').should('exist');
      cy.findByLabelText('Er det påvist manifest strabisme?').should('not.exist');

      cy.findByRole('link', { name: 'Søknad' }).click();
      selectRadioOption('Er søker 10 år eller eldre?', 'Nei');
      cy.findByRole('link', { name: 'Brille-/linseseddel' }).click();

      cy.contains('Du søker om stønad for et barn under 10 år').should('exist');
      cy.findByLabelText('Er det påvist manifest strabisme?').should('exist');
    });

    it('toggles visus, manifest strabisme and previous measurements branches', () => {
      selectRadioOption('Er søker 10 år eller eldre?', 'Nei');
      cy.findByRole('link', { name: 'Brille-/linseseddel' }).click();

      cy.findAllByRole('textbox', { name: 'Visus med gitt korreksjon' }).should('have.length', 2);
      cy.findByRole('textbox', { name: 'Hvorfor er det ikke mulig å oppgi visus?' }).should('not.exist');
      cy.findByLabelText('Type manifest strabisme').should('not.exist');
      cy.findByRole('textbox', { name: 'Måledato (dd.mm.åååå)' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Det er ikke mulig å oppgi visus nå/ }).click();
      cy.findAllByRole('textbox', { name: 'Visus med gitt korreksjon' }).should('have.length', 0);
      cy.findByRole('textbox', { name: 'Hvorfor er det ikke mulig å oppgi visus?' }).should('exist');

      selectRadioOption('Er det påvist manifest strabisme?', 'Ja');
      cy.findByLabelText('Type manifest strabisme').should('exist');

      cy.findByRole('link', { name: 'Søknad' }).click();
      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      cy.findByRole('link', { name: 'Brille-/linseseddel' }).click();
      cy.findByLabelText('Er det foretatt visusmålinger tidligere?').should('exist');
      selectRadioOption('Er det foretatt visusmålinger tidligere?', 'Ja');
      cy.findByRole('textbox', { name: 'Måledato (dd.mm.åååå)' }).should('exist');
    });

    it('shows pristilbud attachment for high strengths that trigger individuelt beløp', () => {
      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      cy.findByRole('link', { name: 'Brille-/linseseddel' }).click();
      fillBrilleLinseseddel({ sphere: '6.25' });
      cy.clickNextStep();
      cy.get('h2#page-title').should('not.contain.text', 'Brille-/linseseddel');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Pristilbud fra optiker/ }).should('exist');
    });
  });

  describe('Kontaktlinser and Vedlegg conditionals', () => {
    it('shows contact lens panel and attachment for contact lens applications', () => {
      visitRoot();
      fillVeiledningAndApplicant();

      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      selectRadioOption('Er søker 18 år eller eldre?', 'Nei');
      chooseSupportType('Kontaktlinser');
      cy.clickNextStep();

      fillBrilleLinseseddel();
      cy.clickNextStep();

      cy.get('h2#page-title').should('contain.text', 'Kontaktlinser');
      cy.findByRole('textbox', { name: 'Beskriv medisinsk behov for kontaktlinser' }).should('exist');
      cy.findByRole('textbox', { name: 'Beskriv medisinsk behov for kontaktlinser' }).type(
        'Søker har medisinsk behov for kontaktlinser.',
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kvittering for kontaktlinser/ }).should('exist');
    });

    it('shows glass and frame attachments for the alternative søknad branches', () => {
      visitPanel('soknad');
      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      cy.clickShowAllSteps();

      chooseSupportType('Bytte av ett glass');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kvittering for kontaktlinser/ }).should('not.exist');
      cy.findByRole('group', { name: /Kvittering for bytte av glass/ }).should('exist');

      cy.findByRole('link', { name: 'Søknad' }).click();
      chooseSupportType('Reparasjon/bytte av innfatning');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kvittering for reparasjon\/bytte av innfatning/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitRoot();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning + Søkers opplysninger
      fillVeiledningAndApplicant();

      // Søknad
      selectRadioOption('Er søker 10 år eller eldre?', 'Ja');
      selectRadioOption('Er søker 18 år eller eldre?', 'Nei');
      chooseSupportType('Bytte av ett glass');
      selectRadioOption('Hva er årsaken til bytte av glass?', 'Glasset er ødelagt');
      cy.clickNextStep();

      // Brille-/linseseddel
      fillBrilleLinseseddel();
      cy.clickNextStep();

      // Stønad til behandlingsbrille
      cy.clickNextStep();

      // Begrunner av søknaden
      cy.findByRole('textbox', { name: 'HPR-nummer' }).type('1000000');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).last().type('Kari');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).last().type('Optiker');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).type('Synsam');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /E-postadresse/ }).type('optiker@example.com');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg
      cy.findByRole('group', { name: /Kvittering for bytte av glass/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });

      goToSummaryFromVedlegg();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søkers opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Etternavn').next('dd').should('contain.text', 'Nordmann');
      });
      cy.withinSummaryGroup('Søknad', () => {
        cy.contains('dt', 'Det søkes om stønad til').next('dd').should('contain.text', 'Bytte av ett glass');
      });
      cy.withinSummaryGroup('Begrunner av søknaden', () => {
        cy.contains('dt', 'HPR-nummer').next('dd').should('contain.text', '1000000');
      });
    });
  });
});
