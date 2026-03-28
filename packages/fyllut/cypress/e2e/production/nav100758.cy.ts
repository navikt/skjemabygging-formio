/*
 * Production form tests for Søknad om stønad til øyeprotese eller ansiktsprotese
 * Form: nav100758
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 same-panel conditional group
 *       identitet.harDuFodselsnummer → adresse visibility + info alert
 *   - Søknaden (soknaden): 4 same-panel conditional groups
 *       soknadenGjelder → ansiktsprotese / oyeprotese branches
 *       soknadenGjelderITilleggBrillerSomErNodvendigForAFesteAnsiktsdefektprotesen → briller alert
 *       kjopAvOyeproteseEllerAnsiktsdefektprotese → harKjopt container + refusjon alert
 *       harDetGattMerEnn6ManederSidenDuAnskaffetOyeEllerAnsiktsdefektprotesen → refusjon reason
 *       ansiktsdefektprotese / oyeprotese documentation + reserve branches
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuTilleggsopplysningerTilSoknaden → tilleggsopplysninger1
 *   - Vedlegg (vedlegg): 2 cross-panel conditional groups from Søknaden
 *       ansiktsprotese/briller/refusjon/reserve answers → attachment visibility
 *       oyeprotese documentation + reserve answers → attachment visibility
 */

const selectSoknadenGjelder = (option: string) => {
  cy.withinComponent('Søknaden gjelder', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectKjopstype = (option: string) => {
  cy.withinComponent('Kjøp av øyeprotese eller ansiktsprotese', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const attachmentLaterOption = /Jeg ettersender dokumentasjonen senere|Jeg sender det etterpå/i;

describe('nav100758', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100758/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address questions only when the user has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('Nav sender svar på søknad').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad').should('exist');
    });
  });

  describe('Søknaden – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100758/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows the briller checkbox only for ansiktsprotese and toggles its alert', () => {
      cy.findByRole('checkbox', {
        name: /Søknaden gjelder i tillegg briller som er nødvendig for å feste ansiktsprotesen/,
      }).should('not.exist');
      cy.contains('Utgifter til brilleinnfatning').should('not.exist');

      selectSoknadenGjelder('Ansiktsprotese');

      cy.findByRole('checkbox', {
        name: /Søknaden gjelder i tillegg briller som er nødvendig for å feste ansiktsprotesen/,
      }).click();
      cy.contains('Utgifter til brilleinnfatning').should('exist');

      cy.findByRole('checkbox', {
        name: /Søknaden gjelder i tillegg briller som er nødvendig for å feste ansiktsprotesen/,
      }).click();
      cy.contains('Utgifter til brilleinnfatning').should('not.exist');

      selectSoknadenGjelder('Øyeprotese');
      cy.findByRole('checkbox', {
        name: /Søknaden gjelder i tillegg briller som er nødvendig for å feste ansiktsprotesen/,
      }).should('not.exist');
    });

    it('shows refund details only for the refusjon path and toggles the reason field after 6 months', () => {
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet øye- eller ansiktsprotesen?').should(
        'not.exist',
      );
      cy.contains('Frist for å søke om refusjon av utgifter er 6 måneder').should('not.exist');

      selectKjopstype('Jeg har kjøpt øyeprotese eller ansiktsprotese og søker refusjon');

      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet øye- eller ansiktsprotesen?').should(
        'exist',
      );
      cy.contains('Frist for å søke om refusjon av utgifter er 6 måneder').should('exist');
      cy.findByRole('textbox', {
        name: 'Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('not.exist');

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet øye- eller ansiktsprotesen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('exist');

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet øye- eller ansiktsprotesen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('not.exist');

      selectKjopstype('Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene');
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet øye- eller ansiktsprotesen?').should(
        'not.exist',
      );
      cy.contains('Frist for å søke om refusjon av utgifter er 6 måneder').should('not.exist');
    });

    it('shows ansiktsprotese gjenanskaffelse and reserve fields for the relevant answers', () => {
      selectSoknadenGjelder('Ansiktsprotese');

      cy.findByRole('group', { name: /Dokumentasjon gjenanskaffelse/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).should('not.exist');

      cy.withinComponent('Er det første gang du søker om stønad til ansiktsprotese?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon gjenanskaffelse/ }).should('exist');

      cy.findByRole('group', { name: /Dokumentasjon gjenanskaffelse/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg begrunner selv hvorfor det er nødvendig med gjenanskaffelse$/,
        }).check();
      });
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('exist');

      cy.findByRole('group', { name: /Dokumentasjon gjenanskaffelse/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg begrunner selv hvorfor det er nødvendig med gjenanskaffelse$/,
        }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg søker om reserveeksemplar av ansiktsprotese/ }).click();
      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).should('exist');

      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg begrunner hvorfor det er nødvendig med reserveeksemplar$/,
        }).check();
      });
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('exist');
    });

    it('shows oyeprotese reserve fields through the custom conditional branch', () => {
      selectSoknadenGjelder('Øyeprotese');

      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg søker om reserveeksemplar av øyeprotese/ }).click();
      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).should('exist');

      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg begrunner hvorfor det er nødvendig med reserveeksemplar$/,
        }).check();
      });
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('exist');

      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg begrunner hvorfor det er nødvendig med reserveeksemplar$/,
        }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100758/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows textarea only when the user has additional information', () => {
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

  describe('Vedlegg – cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100758/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows the expected ansiktsprotese attachments for briller, refusjon and reserve paths', () => {
      selectSoknadenGjelder('Ansiktsprotese');
      cy.findByRole('checkbox', {
        name: /Søknaden gjelder i tillegg briller som er nødvendig for å feste ansiktsprotesen/,
      }).click();
      selectKjopstype('Jeg har kjøpt øyeprotese eller ansiktsprotese og søker refusjon');
      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet øye- eller ansiktsprotesen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er det første gang du søker om stønad til ansiktsprotese?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('checkbox', { name: /Jeg søker om reserveeksemplar av ansiktsprotese/ }).click();
      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg legger ved dokumentasjon fra leverandør som begrunner behovet for reserveeksemplar$/,
        }).check();
      });

      cy.clickNextStep();
      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('group', {
        name: /Spesifisert kvittering som dokumenterer kjøpsdato, produkt og pris/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Erklæring fra legespesialist som dokumenterer behovet for ansiktstprotese/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Erklæring som dokumenterer at briller er nødvendig for å feste ansiktsprotesen/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon fra leverandør på behov for reserveeksemplar av ansiktsprotese/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon fra leverandør på behov for gjenanskaffelse av ansiktsprotese/,
      }).should('not.exist');
    });

    it('shows the expected oyeprotese attachments for gjenanskaffelse and reserve documentation', () => {
      selectSoknadenGjelder('Øyeprotese');
      selectKjopstype('Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene');
      cy.withinComponent('Er det første gang du søker om stønad til øyeprotese?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon gjenanskaffelse/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg legger ved dokumentasjon fra leverandør som begrunner behovet for gjenanskaffelse$/,
        }).check();
      });
      cy.findByRole('checkbox', { name: /Jeg søker om reserveeksemplar av øyeprotese/ }).click();
      cy.findByRole('group', { name: /Dokumentasjon reserveeksemplar/ }).within(() => {
        cy.findByRole('checkbox', {
          name: /^Jeg legger ved dokumentasjon fra leverandør som begrunner behovet for reserveeksemplar$/,
        }).check();
      });

      cy.clickNextStep();
      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('group', {
        name: /Dokumentasjon fra leverandør på behov for gjenanskaffelse av øyeprotese/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon fra leverandør på behov for reserveeksemplar av øyeprotese/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Spesifisert kvittering som dokumenterer kjøpsdato, produkt og pris/,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100758?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.clickNextStep();

      // Søknaden
      selectSoknadenGjelder('Øyeprotese');
      selectKjopstype('Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene');
      cy.withinComponent('Er det første gang du søker om stønad til øyeprotese?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickNextStep();
      cy.findByRole('group', {
        name: /Erklæring fra legespesialist som dokumenterer behovet for øyeprotese/,
      }).within(() => {
        cy.findByRole('radio', { name: attachmentLaterOption }).click();
      });

      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').contains('Fornavn');
        cy.get('dd').contains('Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.get('dt').contains('Søknaden gjelder');
        cy.get('dd').contains('Øyeprotese');
        cy.get('dd').contains('Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene');
      });
    });
  });
});
