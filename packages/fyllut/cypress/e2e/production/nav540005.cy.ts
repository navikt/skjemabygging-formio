/*
 * Production form tests for Søknad om barnebidrag
 * Form: nav540005
 * Submission types: DIGITAL, PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse
 *       identitet.harDuFodselsnummer → alertstripe
 *   - Barn søknaden gjelder for (barnSoknadenGjelderFor): 3 same-panel/cross-panel conditionals
 *       borBarnetINorgeBM → hvilketLandBorBarnet
 *       blirBarnetHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon → annen forsørger
 *       harDuTilsynsordningForBarnet → attachment on Vedlegg
 *   - Søknaden gjelder (soknadenGjelder): 4 same-panel conditionals
 *       hvaSokerDuOm → hvaErGrunnenTilAtDuSokerOmEndring / monthPicker
 *       sokerDuTilbakeITid → reason textarea
 *       fastsettelse + bidragsmottaker → economic contribution question
 *   - Om den andre parten (omDenAndreParten): 4 same-panel conditionals
 *       harMotpartenNorskFodselsnummerEllerDNummer → fødselsdato / address path
 *       borMotpartenINorge + vetDuAdressen → norsk / utenlandsk adresse
 */

const submissionMethod = '?sub=paper';

const futureMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);

  return `${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;
};

const chooseBidragsmottaker = () => {
  cy.withinComponent('Hvilken part er du i saken?', () => {
    cy.findByRole('radio', { name: 'Bidragsmottaker' }).click();
  });
};

const fillDineOpplysningerWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillSingleChildForBidragsmottaker = ({
  childLivesInNorway = 'Ja',
  underInstitution = 'Nei',
  hasChildcare = 'Nei',
}: {
  childLivesInNorway?: 'Ja' | 'Nei';
  underInstitution?: 'Ja' | 'Nei';
  hasChildcare?: 'Ja' | 'Nei';
} = {}) => {
  cy.withinComponent('Skal du søke for ett eller flere barn?', () => {
    cy.findByRole('radio', { name: 'Jeg skal søke for ett barn' }).click();
  });
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
  cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).type('15.01.2015');

  cy.withinComponent('Bor barnet i Norge?', () => {
    cy.findByRole('radio', { name: childLivesInNorway }).click();
  });

  if (childLivesInNorway === 'Nei') {
    cy.findByRole('combobox', { name: 'Hvilket land bor barnet i?' }).type('Sver{downArrow}{enter}');
  }

  cy.withinComponent('Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon?', () => {
    cy.findByRole('radio', { name: underInstitution }).click();
  });

  if (underInstitution === 'Ja') {
    cy.findByRole('textbox', { name: 'Navn' }).type('Barnevernstjenesten');
    cy.findByRole('textbox', { name: 'Adresse' }).type('Institusjonsveien 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
    cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
    cy.withinComponent('Oppgi forsørgelsesgrad', () => {
      cy.findByRole('radio', { name: 'Helt' }).click();
    });
  }

  cy.withinComponent('Har barnet en tilsynsordning?', () => {
    cy.findByRole('radio', { name: hasChildcare }).click();
  });
};

const goToBarnPanelAsBidragsmottaker = () => {
  cy.visit(`/fyllut/nav540005/partISaken${submissionMethod}`);
  cy.defaultWaits();
  chooseBidragsmottaker();
  cy.clickNextStep();
  fillDineOpplysningerWithFnr();
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Barn søknaden gjelder for' }).should('exist');
};

const fillSoknadenGjelderForFastsettelse = ({
  tilbakeITid = 'Nei',
  skatteetaten = 'Nei, vi gjør opp privat oss i mellom',
}: {
  tilbakeITid?: 'Ja' | 'Nei';
  skatteetaten?:
    | 'Ja, jeg ønsker at Skatteetaten skal kreve inn bidraget'
    | 'Nei, vi gjør opp privat oss i mellom'
    | 'Skatteetaten krever inn bidraget i dag';
} = {}) => {
  cy.withinComponent('Hva søker du om?', () => {
    cy.findByRole('radio', { name: 'Fastsettelse av barnebidrag' }).click();
  });
  cy.withinComponent('Søker du tilbake i tid?', () => {
    cy.findByRole('radio', { name: tilbakeITid }).click();
  });

  if (tilbakeITid === 'Ja') {
    cy.findByRole('textbox', {
      name: 'Hva er grunnen til at du søker tilbake i tid, og hvorfor har du ikke søkt før?',
    }).type('Behovet oppstod tidligere.');
    cy.withinComponent(
      'Har den andre parten bidratt til å forsørge barnet økonomisk i perioden du søker tilbake i tid?',
      () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      },
    );
  }

  cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).type(futureMonth());
  cy.withinComponent('Ønsker du at Skatteetaten skal kreve inn barnebidraget?', () => {
    cy.findByRole('radio', { name: skatteetaten }).click();
  });
};

const fillBarnsBostedOgSamvaerMinimal = ({ hasHolidayContact = 'Nei' }: { hasHolidayContact?: 'Ja' | 'Nei' } = {}) => {
  cy.withinComponent('Bor barnet fast hos deg?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Har barnet bodd fast hos deg siden fødselen?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Har barnet delt fast bosted?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Er det avtalt eller fastsatt at den bidragspliktige skal ha samvær med barnet?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Samværet er avtalt eller fastsatt ved', () => {
    cy.findByRole('radio', { name: 'skriftlig avtale' }).click();
  });
  cy.findByLabelText('Oppgi antall overnattinger over en 14 dagers periode').type('4');
  cy.findByLabelText('Antall dager med samvær uten overnatting over en 14 dagers periode').type('0');
  cy.withinComponent('Har barnet samvær i ferier?', () => {
    cy.findByRole('radio', { name: hasHolidayContact }).click();
  });
  cy.withinComponent('Gjennomføres samværet slik det er avtalt?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
};

describe('nav540005', () => {
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
      cy.visit(`/fyllut/nav540005/dineOpplysninger${submissionMethod}`);
      cy.defaultWaits();
    });

    it('shows address fields when user has no fnr and hides them with alertstripe when user has fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByText(/Nav sender svar på søknad/).should('exist');
    });
  });

  describe('Barn søknaden gjelder for conditionals', () => {
    beforeEach(() => {
      goToBarnPanelAsBidragsmottaker();
    });

    it('shows country and institution details for relevant child answers', () => {
      cy.withinComponent('Skal du søke for ett eller flere barn?', () => {
        cy.findByRole('radio', { name: 'Jeg skal søke for ett barn' }).click();
      });
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
      cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).type('15.01.2015');

      cy.findByRole('combobox', { name: 'Hvilket land bor barnet i?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');

      cy.withinComponent('Bor barnet i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bor barnet i?' }).should('exist');

      cy.withinComponent('Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Navn' }).should('exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');

      cy.withinComponent('Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');
    });

    it('shows childcare attachment on Vedlegg only when barnet has tilsynsordning', () => {
      fillSingleChildForBidragsmottaker({ hasChildcare: 'Ja' });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Faktura for tilsynsordning - søknadsbarn/ }).should('exist');
    });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      goToBarnPanelAsBidragsmottaker();
      fillSingleChildForBidragsmottaker();
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Søknaden gjelder' }).should('exist');
    });

    it('toggles endring fields versus fastsettelse with tilbake i tid follow-ups', () => {
      cy.findByRole('textbox', { name: /Hva er grunnen til at du søker om endring/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).should('not.exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Endring av barnebidrag' }).click();
      });
      cy.findByRole('textbox', { name: /Hva er grunnen til at du søker om endring/ }).should('exist');
      cy.findByRole('textbox', { name: /Jeg søker om endring fra og med/ }).should('exist');
      cy.findByLabelText(
        'Har den andre parten bidratt til å forsørge barnet økonomisk i perioden du søker tilbake i tid?',
      ).should('not.exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Fastsettelse av barnebidrag' }).click();
      });
      cy.findByRole('textbox', { name: /Hva er grunnen til at du søker om endring/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Jeg søker om fastsettelse fra og med/ }).should('exist');
      cy.findByLabelText(
        'Har den andre parten bidratt til å forsørge barnet økonomisk i perioden du søker tilbake i tid?',
      ).should('not.exist');

      cy.withinComponent('Søker du tilbake i tid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Hva er grunnen til at du søker tilbake i tid, og hvorfor har du ikke søkt før?',
      }).should('exist');
      cy.findByLabelText(
        'Har den andre parten bidratt til å forsørge barnet økonomisk i perioden du søker tilbake i tid?',
      ).should('exist');

      cy.withinComponent('Søker du tilbake i tid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Hva er grunnen til at du søker tilbake i tid, og hvorfor har du ikke søkt før?',
      }).should('not.exist');
    });
  });

  describe('Om den andre parten conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav540005/omDenAndreParten${submissionMethod}`);
      cy.defaultWaits();
    });

    it('switches between birth date and address branches for the other party', () => {
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('not.exist');

      cy.withinComponent('Kjenner du den andre partens norske fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('exist');

      cy.withinComponent('Vet du fødselsdatoen til den andre parten?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Den andre partens fødselsdato/ }).should('exist');

      cy.withinComponent('Bor den andre parten i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('exist');

      cy.withinComponent('Bor den andre parten i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav540005${submissionMethod}`);
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      chooseBidragsmottaker();
      cy.clickNextStep();

      fillDineOpplysningerWithFnr();
      cy.clickNextStep();

      fillSingleChildForBidragsmottaker();
      cy.clickNextStep();

      fillSoknadenGjelderForFastsettelse();
      cy.clickNextStep();

      fillBarnsBostedOgSamvaerMinimal();
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Om den andre parten' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Motpart');
      cy.withinComponent('Kjenner du den andre partens norske fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Vet du fødselsdatoen til den andre parten?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Den andre partens fødselsdato/ }).type('01.01.1990');
      cy.withinComponent('Bor den andre parten i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Vet du adressen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Samlivsbrudd' }).should('exist');
      cy.withinComponent('Du og den andre partens boforhold', () => {
        cy.findByRole('radio', { name: 'Vi har ikke bodd sammen' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Nåværende bidrag' }).should('exist');
      cy.withinComponent('Har du en avtale om barnebidrag for det barnet du søker for?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Din jobb' }).should('exist');
      cy.withinComponent('Er du i jobb?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: /Kryss av for det som gjelder for deg/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Ansatt' }).check();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Din inntekt' }).should('exist');
      cy.withinComponent('Har du skattepliktig inntekt i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du skattepliktig inntekt som selvstendig næringsdrivende eller frilanser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.findByRole('group', { name: /Avtale om samvær/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Part i saken', () => {
        cy.contains('dt', 'Hvilken part er du i saken?').next('dd').should('contain.text', 'Bidragsmottaker');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Barn søknaden gjelder for', () => {
        cy.contains('dt', 'Barnets fornavn').next('dd').should('contain.text', 'Sara');
      });
    });
  });
});
