/*
 * Production form tests for Søknad om stønad til parykk
 * Form: nav100757
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut skjemaet (hvemSomFyllerUtSkjemaet): 5 same-panel conditionals
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → erDuOver18Ar, rolle, alertstripes
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → fullmakt/verge guidance
 *   - Dine opplysninger (personopplysninger): 4 conditionals
 *       identitet.harDuFodselsnummer → adresse, folkeregister-alert
 *       adresse.borDuINorge + vegadresseEllerPostboksadresse → adresseVarighet
 *       jegHarIkkeTelefonnummer → telefonnummer hidden
 *   - Søknaden (soknaden): 7 same-panel conditionals
 *       harDuFylt30Ar → age-specific application branch
 *       hvaSokerDuOm (30+) → maDetTasSpesielleHensynVedValgAvHarerstatning
 *       erDetForsteGangDuSokerOmStonadTilParykkEllerHodeplagg → erDetMerEnn3ArSiden...
 *       sokerDuOmRefusjonEllerForhandsgodkjenning → refusjon follow-ups
 *       skyldesHartapetEnYrkesskade → yrkesskade/kjønnsinkongruens follow-ups
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuTilleggsopplysningerTilSoknaden → tilleggsopplysninger1
 *   - Vedlegg (vedlegg): cross-panel conditionals from representative role and application answers
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → fullmakt / dokumentasjonPaAtDuErVerge
 *       soknaden answers → medical, receipt, yrkesskade, and special-hensyn attachments
 */

const selectApplicantRole = (role: 'Jeg er foresatt' | 'Jeg er verge' | 'Jeg har fullmakt') => {
  cy.withinComponent('Hva er din rolle?', () => {
    cy.findByRole('radio', { name: role }).click();
  });
};

const answerRepresentativeFullmaktFlow = () => {
  cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  selectApplicantRole('Jeg har fullmakt');
};

const answerRepresentativeVergeFlow = () => {
  cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  selectApplicantRole('Jeg er verge');
};

const clickCheckboxByName = (name: string | RegExp) => {
  cy.contains('label', name).then(($label) => {
    const inLabel = $label.find('input[type="checkbox"]');
    const inFieldset = $label.closest('fieldset').find('input[type="checkbox"]');
    const target = (inLabel.length ? inLabel : inFieldset).first().get(0) as HTMLInputElement | undefined;
    if (target) {
      target.click();
    }
  });
};

const fillApplicationForMedicalAttachment = () => {
  cy.withinComponent('Har du fylt 30 år?', () => {
    cy.findByRole('radio', { name: 'Nei, jeg er yngre enn 30 år' }).click();
  });
  cy.withinComponent('Hva søker du om?', () => {
    cy.findByRole('radio', {
      name: 'Jeg søker om stønad til hodeplagg, hårforlengelse eller hårintegrasjon',
    }).click();
  });
  cy.withinComponent('Er det første gang du søker om stønad til hårerstatning?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
    cy.findByRole('radio', {
      name: 'Jeg ønsker at Nav vurderer om jeg oppfyller vilkårene for stønad før jeg går til anskaffelse av hårerstatning',
    }).click();
  });
  cy.withinComponent('Skyldes hårtapet en yrkesskade?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Søker du om hårerstatning fordi du har kjønnsinkongruens?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const openVedleggFromSoknaden = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

describe('nav100757', () => {
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
      cy.visit('/fyllut/nav100757/hvemSomFyllerUtSkjemaet?sub=paper');
      cy.defaultWaits();
    });

    it('shows representative questions and documentation guidance when applying for someone else', () => {
      cy.contains('søknaden per post').should('not.exist');

      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.contains('søknaden per post').should('exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen').should('exist');

      selectApplicantRole('Jeg har fullmakt');
      cy.contains('Du må legge ved en').should('exist');

      selectApplicantRole('Jeg er verge');
      cy.contains('Du må legge ved dokumentasjon på at du er verge').should('exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100757/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address flow when the applicant has no fødselsnummer and hides phone when checkbox is checked', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      clickCheckboxByName(/Jeg har ikke telefonnummer/);
      cy.findByLabelText('Telefonnummer').should('not.exist');
      clickCheckboxByName(/Jeg har ikke telefonnummer/);
      cy.findByLabelText('Telefonnummer').should('exist');
    });

    it('shows folkeregister alert and hides address when the applicant has fødselsnummer', () => {
      cy.contains('Nav sender svar på søknad').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.contains('Nav sender svar på søknad').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Søknaden conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100757/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows special hair replacement considerations only for applicants over 30 applying for parykk', () => {
      cy.findByLabelText('Må det tas spesielle hensyn ved valg av hårerstatning?').should('not.exist');

      cy.withinComponent('Har du fylt 30 år?', () => {
        cy.findByRole('radio', { name: 'Ja, jeg er 30 år eller eldre' }).click();
      });
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om stønad til parykk/hårdeler' }).click();
      });
      cy.findByLabelText('Må det tas spesielle hensyn ved valg av hårerstatning?').should('exist');

      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', {
          name: 'Jeg søker om stønad til hodeplagg, hårforlengelse eller hårintegrasjon',
        }).click();
      });
      cy.findByLabelText('Må det tas spesielle hensyn ved valg av hårerstatning?').should('not.exist');
    });

    it('shows follow-up questions for repeat applications, refusjon, and yrkesskade', () => {
      cy.findByLabelText('Er det mer enn 3 år siden du sist fikk stønad til hårerstatning?').should('not.exist');
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet parykken eller hodeplagget?').should(
        'not.exist',
      );
      cy.findByRole('textbox', {
        name: 'Forklar hvorfor du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('not.exist');
      cy.findByLabelText('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?').should('not.exist');
      cy.findByLabelText('Søker du om hårerstatning fordi du har kjønnsinkongruens?').should('not.exist');

      cy.withinComponent('Har du fylt 30 år?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg er yngre enn 30 år' }).click();
      });
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', {
          name: 'Jeg søker om stønad til hodeplagg, hårforlengelse eller hårintegrasjon',
        }).click();
      });
      cy.withinComponent('Er det første gang du søker om stønad til hårerstatning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er det mer enn 3 år siden du sist fikk stønad til hårerstatning?').should('exist');

      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: 'Jeg har hatt utgifter og søker refusjon' }).click();
      });
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet parykken eller hodeplagget?').should(
        'exist',
      );

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet parykken eller hodeplagget?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Frist for å søke om refusjon av utgifter er 6 måneder').should('exist');
      cy.findByRole('textbox', {
        name: 'Forklar hvorfor du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('exist');

      cy.withinComponent('Skyldes hårtapet en yrkesskade?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?').should('exist');
      cy.findByLabelText('Søker du om hårerstatning fordi du har kjønnsinkongruens?').should('not.exist');

      cy.withinComponent('Skyldes hårtapet en yrkesskade?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?').should('not.exist');
      cy.findByLabelText('Søker du om hårerstatning fordi du har kjønnsinkongruens?').should('exist');
    });
  });

  describe('Tilleggsopplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100757/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows textarea when the applicant has additional information', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows fullmakt attachment when representative has fullmakt', () => {
      cy.visit('/fyllut/nav100757/hvemSomFyllerUtSkjemaet?sub=paper');
      cy.defaultWaits();

      answerRepresentativeFullmaktFlow();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på at du er verge/ }).should('not.exist');
    });

    it('shows verge attachment when representative is verge', () => {
      cy.visit('/fyllut/nav100757/hvemSomFyllerUtSkjemaet?sub=paper');
      cy.defaultWaits();

      answerRepresentativeVergeFlow();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt/ }).should('not.exist');
      cy.findByText(/Dokumentasjon på at du er verge|Kopi av verge- eller hjelpevergeattest/).should('exist');
    });

    it('shows the relevant medical and receipt attachments for the chosen application path', () => {
      cy.visit('/fyllut/nav100757/soknaden?sub=paper');
      cy.defaultWaits();

      fillApplicationForMedicalAttachment();
      cy.withinComponent('Søker du om hårerstatning fordi du har kjønnsinkongruens?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: 'Jeg har hatt utgifter og søker refusjon' }).click();
      });
      openVedleggFromSoknaden();

      cy.findByRole('group', {
        name: /Erklæring fra lege som dokumenterer omfanget av, årsaken til og forventet varighet av hårtapet/,
      }).should('not.exist');
      cy.findByRole('group', {
        name: /Dokumentasjon fra lege eller annet helsepersonell på at du har kjønnsinkongruens/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon fra lege eller annet helsepersonell på omfanget av hårtapet/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Kvittering som spesifiserer kjøpsdato, produkt, antall og pris/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Vedtak om godkjent yrkesskade som dokumenterer at hårtapet skyldes en yrkesskade/,
      }).should('not.exist');
    });

    it('shows yrkesskade attachment when prior documentation has not been submitted', () => {
      cy.visit('/fyllut/nav100757/soknaden?sub=paper');
      cy.defaultWaits();

      fillApplicationForMedicalAttachment();
      cy.withinComponent('Skyldes hårtapet en yrkesskade?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      openVedleggFromSoknaden();

      cy.findByText('Vedtak om godkjent yrkesskade som dokumenterer at hårtapet skyldes en yrkesskade').should('exist');
    });

    it('shows special-hensyn attachments for hodeform and allergi branches', () => {
      cy.visit('/fyllut/nav100757/soknaden?sub=paper');
      cy.defaultWaits();

      cy.withinComponent('Har du fylt 30 år?', () => {
        cy.findByRole('radio', { name: 'Ja, jeg er 30 år eller eldre' }).click();
      });
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Jeg søker om stønad til parykk/hårdeler' }).click();
      });
      cy.withinComponent('Er det første gang du søker om stønad til hårerstatning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', {
          name: 'Jeg ønsker at Nav vurderer om jeg oppfyller vilkårene for stønad før jeg går til anskaffelse av hårerstatning',
        }).click();
      });
      cy.withinComponent('Skyldes hårtapet en yrkesskade?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Søker du om hårerstatning fordi du har kjønnsinkongruens?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Må det tas spesielle hensyn ved valg av hårerstatning?', () => {
        cy.findByRole('radio', {
          name: 'Ja, jeg trenger en individuelt tillaget parykk på grunn av hodeformen',
        }).click();
      });
      openVedleggFromSoknaden();
      cy.findByRole('group', {
        name: /Legeerklæring og eventuell uttalelse fra frisør om hvordan hodeformen gjør at du ikke kan bruke en standard parykk/,
      }).should('exist');

      cy.findByRole('link', { name: 'Søknaden' }).click();
      cy.withinComponent('Må det tas spesielle hensyn ved valg av hårerstatning?', () => {
        cy.findByRole('radio', {
          name: 'Ja, jeg må bruke parykk av ekte hår fordi jeg har allergi mot syntetisk hår',
        }).click();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon fra hudlege eller spesialavdeling på sykehus på at du er allergisk mot syntetisk hår/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100757?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Hvem som fyller ut skjemaet
      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hva er din rolle?', () => {
        cy.findByRole('radio', { name: 'Jeg er foresatt' }).click();
      });
      cy.clickNextStep();

      // Veiledning
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Søknaden
      cy.withinComponent('Har du fylt 30 år?', () => {
        cy.findByRole('radio', { name: 'Nei, jeg er yngre enn 30 år' }).click();
      });
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', {
          name: 'Jeg søker om stønad til hodeplagg, hårforlengelse eller hårintegrasjon',
        }).click();
      });
      cy.withinComponent('Er det første gang du søker om stønad til hårerstatning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', {
          name: 'Jeg ønsker at Nav vurderer om jeg oppfyller vilkårene for stønad før jeg går til anskaffelse av hårerstatning',
        }).click();
      });
      cy.withinComponent('Skyldes hårtapet en yrkesskade?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Søker du om hårerstatning fordi du har kjønnsinkongruens?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg (isAttachmentPanel=true)
      cy.findByRole('group', {
        name: /Erklæring fra lege som dokumenterer omfanget av, årsaken til og forventet varighet av hårtapet/,
      }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.contains('dd', 'Jeg søker om stønad til hodeplagg, hårforlengelse eller hårintegrasjon').should('exist');
        cy.contains('dd', 'Nei').should('exist');
      });
    });
  });
});
