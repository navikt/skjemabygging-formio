/*
 * Production form tests for Søknad om barnetrygd
 * Form: nav330007
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Om deg som søker (omDegSomSoker): 3 panel-level conditionals
 *       hvemErDuSomSoker → Dine opplysninger / Om barnet / Opplysninger om deg som er verge
 *   - Dine opplysninger (dineOpplysninger): 2 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse
 *       jegHarIkkeTelefonnummer → telefonnummer
 *   - Søknaden gjelder (soknadenGjelder): 3 conditionals
 *       hvemErDuSomSoker → utvidet-barnetrygd question
 *       vilDuSokeOmUtvidetBarnetrygdITilleggTilOrdinaerBarnetrygd → sokerDuDeltBarnetrygd1 + panel situasjonenDin
 *       sokerDuDeltBarnetrygd1 → alertstripe
 *   - Situasjonen din (situasjonenDin): 4 same-panel conditionals
 *       hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 → redegjorForArsakTil1
 *       hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 → separertSkiltEllerEnkeEnkemann1
 *       erDuSeparertSkiltEllerEnkeEnkemannUtenAtDetteErRegistrertIFolkeregisteretINorge → erDuSeparertSkiltEllerEnkeEnkemannIUtlandet + alertstripe
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from situasjonenDin
 *       hvaErArsakenTilAtDuSokerOmUtvidetBarnetrygd1 → kopiAvSkilsmisseEllerSeparasjonsbevilling
 */

const chooseApplicantRole = (role: 'Forelder' | 'Verge') => {
  cy.withinComponent('Hvem er du som søker?', () => {
    cy.findByRole('radio', { name: role }).click();
  });
};

const chooseUtvidetBarnetrygd = (value: 'Ja' | 'Nei') => {
  cy.withinComponent('Vil du søke om utvidet barnetrygd i tillegg til ordinær barnetrygd?', () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const visitApplicantPanel = () => {
  cy.visit('/fyllut/nav330007/omDegSomSoker?sub=paper');
  cy.defaultWaits();
};

const openPanelForForelder = (panelTitle: string) => {
  visitApplicantPanel();
  chooseApplicantRole('Forelder');
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const fillParentDetailsMinimum = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).clear();
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).clear();
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).clear();
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
};

const goToSoknadenGjelderForForelder = () => {
  visitApplicantPanel();
  chooseApplicantRole('Forelder');
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Veiledning' }).should('exist');
  cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
  fillParentDetailsMinimum();
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Søknaden gjelder' }).should('exist');
};

const goToSituasjonenDinForForelder = () => {
  goToSoknadenGjelderForForelder();
  chooseUtvidetBarnetrygd('Ja');
  cy.withinComponent('Søker du delt barnetrygd?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Situasjonen din' }).should('exist');
};

describe('nav330007', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Om deg som søker conditionals', () => {
    beforeEach(() => {
      visitApplicantPanel();
      cy.clickShowAllSteps();
    });

    it('toggles parent and guardian specific panels in the stepper', () => {
      chooseApplicantRole('Forelder');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Om barnet' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om deg som er verge' }).should('not.exist');

      chooseApplicantRole('Verge');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('not.exist');
      cy.findByRole('link', { name: 'Om barnet' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om deg som er verge' }).should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      openPanelForForelder('Dine opplysninger');
    });

    it('shows address fields without fnr and hides phone when checkbox is checked', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');
    });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      openPanelForForelder('Søknaden gjelder');
    });

    it('shows delt barnetrygd follow-up and situasjonen din when utvidet barnetrygd is selected', () => {
      cy.findByLabelText('Søker du delt barnetrygd?').should('not.exist');
      cy.findByRole('link', { name: 'Situasjonen din' }).should('not.exist');

      chooseUtvidetBarnetrygd('Ja');

      cy.findByLabelText('Søker du delt barnetrygd?').should('exist');
      cy.findByRole('link', { name: 'Situasjonen din' }).should('exist');

      cy.withinComponent('Søker du delt barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Begge foreldrene må søke').should('exist');

      chooseUtvidetBarnetrygd('Nei');
      cy.findByLabelText('Søker du delt barnetrygd?').should('not.exist');
      cy.findByRole('link', { name: 'Situasjonen din' }).should('not.exist');
    });
  });

  describe('Situasjonen din conditionals', () => {
    beforeEach(() => {
      goToSituasjonenDinForForelder();
    });

    it('switches between free-text and separation follow-up branches', () => {
      cy.findByRole('textbox', { name: 'Forklar årsaken til at du søker om utvidet barnetrygd?' }).should('not.exist');
      cy.findByLabelText(
        'Er du separert, skilt eller enke/enkemann uten at dette er registrert i folkeregisteret i Norge?',
      ).should('not.exist');

      cy.withinComponent('Hva er årsaken til at du søker om utvidet barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Annen årsak' }).click();
      });
      cy.findByRole('textbox', { name: 'Forklar årsaken til at du søker om utvidet barnetrygd?' }).should('exist');
      cy.findByLabelText('Har du samboer nå?').should('exist');

      cy.withinComponent('Hva er årsaken til at du søker om utvidet barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Jeg er separert' }).click();
      });
      cy.findByRole('textbox', { name: 'Forklar årsaken til at du søker om utvidet barnetrygd?' }).should('not.exist');
      cy.findByLabelText(
        'Er du separert, skilt eller enke/enkemann uten at dette er registrert i folkeregisteret i Norge?',
      ).should('exist');
    });

    it('shows foreign-separation follow-up and alert when folkeregister status is not registered', () => {
      cy.findByLabelText('Er du separert, skilt eller enke/enkemann i utlandet?').should('not.exist');
      cy.contains('må du legge ved bekreftelse på separasjon').should('not.exist');

      cy.withinComponent('Hva er årsaken til at du søker om utvidet barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Jeg er separert' }).click();
      });

      cy.withinComponent(
        'Er du separert, skilt eller enke/enkemann uten at dette er registrert i folkeregisteret i Norge?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText('Er du separert, skilt eller enke/enkemann i utlandet?').should('exist');
      cy.contains('må du legge ved bekreftelse på separasjon, skilsmisse eller enkestatus').should('exist');

      cy.withinComponent(
        'Er du separert, skilt eller enke/enkemann uten at dette er registrert i folkeregisteret i Norge?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText('Er du separert, skilt eller enke/enkemann i utlandet?').should('not.exist');
      cy.contains('må du legge ved bekreftelse på separasjon, skilsmisse eller enkestatus').should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      goToSituasjonenDinForForelder();
    });

    it('shows separation attachment only for separated branch', () => {
      cy.withinComponent('Hva er årsaken til at du søker om utvidet barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Jeg er separert' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByText('Kopi av skilsmisse- eller separasjonsbevilling').should('exist');

      cy.findByRole('link', { name: 'Situasjonen din' }).click();
      cy.withinComponent('Hva er årsaken til at du søker om utvidet barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Jeg har bodd alene etter at jeg fikk barn' }).click();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByText('Kopi av skilsmisse- eller separasjonsbevilling').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav330007/omDegSomSoker?sub=paper');
      cy.defaultWaits();
    });

    it('fills a forelder happy path and verifies the summary', () => {
      cy.findByRole('heading', { level: 2, name: 'Om deg som søker' }).should('exist');
      chooseApplicantRole('Forelder');
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Veiledning' }).should('exist');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
      fillParentDetailsMinimum();
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Søknaden gjelder' }).should('exist');
      chooseUtvidetBarnetrygd('Ja');
      cy.withinComponent('Søker du delt barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Situasjonen din' }).should('exist');
      cy.withinComponent('Hva er årsaken til at du søker om utvidet barnetrygd?', () => {
        cy.findByRole('radio', { name: 'Jeg har bodd alene etter at jeg fikk barn' }).click();
      });
      cy.withinComponent('Har du hatt samboer tidligere i perioden du søker barnetrygd for?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Dine utenlandsopphold' }).should('exist');
      cy.withinComponent('Har du oppholdt deg sammenhengende i Norge de siste tolv månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Arbeid utenfor Norge' }).should('exist');
      cy.withinComponent(
        'Arbeider eller har du arbeidet utenfor Norge, på utenlandsk skip eller på utenlandsk kontinentalsokkel?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Pensjon fra utlandet' }).should('exist');
      cy.withinComponent('Får eller har du fått pensjon fra utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Barn du søker barnetrygd for' }).should('exist');
      cy.withinComponent('Er barnet født?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Barnesen');
      cy.findByRole('textbox', { name: 'Barnets fødselsnummer eller d-nummer' }).type('17912099997');
      cy.withinComponent('Er barnet fosterbarn?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn / Etternavn' }).type('Per Andre');
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('01017010170');
      cy.withinComponent('Bor den andre forelderen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(
        'Arbeider eller har den andre forelderen til barnet arbeidet utenfor Norge, på utenlandsk skip eller på utenlandsk kontinentalsokkel?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Får eller har den andre forelderen pensjon fra utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Får eller har den andre forelderen fått barnetrygd for dette barnet fra et annet EØS-land?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Bor barnet fast sammen med deg?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du og den andre forelderen skriftlig avtale om delt bosted for barnet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Bor du sammen med barnets andre forelder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du bodd sammen med barnets andre forelder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er barnet i barnverninstitusjon eller i annen institusjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er barnet adoptert fra utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er det søkt om asyl i Norge for barnet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har barnet oppholdt seg sammenhengende i Norge de siste tolv månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Får du, eller har du fått barnetrygd for barnet fra et annet EØS-land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du søkt om barnetrygd for barnet fra et annet EØS-land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Tilleggsopplysninger' }).should('exist');
      cy.withinComponent('Ønsker du å gi andre opplysninger til Nav utover det du allerede har oppgitt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      cy.get('body').then(($body) => {
        if (!$body.text().includes('Oppsummering')) {
          cy.clickNextStep();
        }
      });

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om deg som søker', () => {
        cy.contains('dt', 'Hvem er du som søker?').next('dd').should('contain.text', 'Forelder');
      });
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dt', 'Vil du søke om utvidet barnetrygd i tillegg til ordinær barnetrygd?')
          .next('dd')
          .should('contain.text', 'Ja');
      });
      cy.withinSummaryGroup('Situasjonen din', () => {
        cy.contains('dt', 'Hva er årsaken til at du søker om utvidet barnetrygd?')
          .next('dd')
          .should('contain.text', 'Jeg har bodd alene etter at jeg fikk barn');
      });
      cy.withinSummaryGroup('Barn du søker barnetrygd for', () => {
        cy.contains('dt', 'Bor barnet fast sammen med deg?').next('dd').should('contain.text', 'Ja');
      });
    });
  });
});
