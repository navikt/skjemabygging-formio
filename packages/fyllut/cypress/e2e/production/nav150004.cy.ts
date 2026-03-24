/*
 * Production form tests for Søknad om stønad til skolepenger - enslig mor eller far
 * Form: nav150004
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Søknaden (soknaden): 1 same-panel conditional
 *       sokerDuOmStonadTilSkolepengerFraEtBestemtTidspunkt → period dates
 *   - Dine opplysninger (dineOopplysninger): 2 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       harIkkeTelefon → telefonnummer hidden
 *   - Sivilstatus og bosituasjon (sivilstatusOgBosituasjon): 5 same-panel conditionals
 *       angiDinSivilstand → marriage/separation/samboer branches
 *       harSamboerNorskFodselsnummerEllerDNummer → fnr vs birthdate
 *       + 1 cross-panel trigger to Vedlegg
 *   - Oppholdstillatelse (oppholdstillatelse): 1 same-panel + 1 Vedlegg conditional
 *       erDuNordiskStatsborger → citizenship datagrid
 *       erDuNordiskStatsborger → bekreftelsePaOppholdstillatelse
 *   - Opplysninger om barn under 18 år som du har omsorgen for: row-scoped conditionals
 *       harDuOmsorgForBarnUnder18Ar → datagrid
 *       borBarnetFastSammenMedDeg / hvordanErDeltBostedAvtalt → address and Vedlegg attachment
 *       harDenAndreForelderenSamvaerMedBarnet / harDereSkriftligSamvaersavtale → samvær textarea
 *       kjennerDuTil... / vetDuHvaDetteNummeretEr / borDenAndreForelderenIUtlandet → parent details
 *   - Opplysninger om utdanningen (opplysningerOmUtdanningen): 6 same-panel conditionals
 *       studieTid, typeUtdanning and hvilkeUtgifterSokerDuStonadTil branches
 *   - Andre opplysninger (andreOpplysninger): 1 same-panel conditional
 *       harDuAndreOpplysningerTilSaken → andreOpplysninger1
 */

const visitWithFreshState = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
  cy.get('#page-title').should('exist');
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav150004/${panelKey}?sub=paper`);
};

const answerRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setSelectboxesOption = (groupLabel: string | RegExp, option: string, checked: boolean) => {
  cy.findByRole('group', { name: groupLabel }).within(() => {
    if (checked) {
      cy.findByRole('checkbox', { name: option }).check();
      return;
    }

    cy.findByRole('checkbox', { name: option }).uncheck();
  });
};

const fillSharedChildBasics = () => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Mia');
  cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).type('01.01.2020');
};

const fillOtherParentBase = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Forelder');
};

describe('nav150004', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Søknaden conditionals', () => {
    beforeEach(() => {
      visitPanel('soknaden');
    });

    it('shows the period fields only when applying from a specific date', () => {
      cy.findByLabelText('Fra dato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Til dato (dd.mm.åååå)').should('not.exist');

      answerRadio('Søker du om stønad til skolepenger fra et bestemt tidspunkt?', 'Ja');
      cy.findByLabelText('Fra dato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Til dato (dd.mm.åååå)').should('exist');

      answerRadio('Søker du om stønad til skolepenger fra et bestemt tidspunkt?', 'Nei');
      cy.findByLabelText('Fra dato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Til dato (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOopplysninger');
    });

    it('shows address fields only when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('hides the phone input when the no-phone checkbox is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Sivilstatus og bosituasjon conditionals', () => {
    beforeEach(() => {
      visitPanel('sivilstatusOgBosituasjon');
    });

    it('switches between marriage, separation and samboer branches', () => {
      cy.findByLabelText('Ble du gift/fikk registrert partnerskap i utlandet?').should('not.exist');
      cy.findByLabelText('Dato for faktisk samlivsbrudd (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Når flyttet dere sammen? Dato (dd.mm.åååå)').should('not.exist');

      answerRadio('Hva er din sivilstand?', 'Gift/ registrert partnerskap');
      cy.findByLabelText('Ble du gift/fikk registrert partnerskap i utlandet?').should('exist');
      cy.findByLabelText('Har du planer om å gifte deg eller bli samboer?').should('not.exist');

      answerRadio('Hva er din sivilstand?', 'Separert');
      cy.findByLabelText('Dato for faktisk samlivsbrudd (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Deler du bolig med andre voksne?').should('exist');
      cy.findByLabelText('Har du planer om å gifte deg eller bli samboer?').should('exist');

      answerRadio('Har du planer om å gifte deg eller bli samboer?', 'Ja');
      cy.findByRole('textbox', { name: 'Når skal dette skje?' }).should('exist');

      answerRadio('Hva er din sivilstand?', 'Samboer');
      cy.findByLabelText('Dato for faktisk samlivsbrudd (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Har du planer om å gifte deg eller bli samboer?').should('not.exist');
      cy.findByLabelText('Når flyttet dere sammen? Dato (dd.mm.åååå)').should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');

      answerRadio('Har samboer norsk fødselsnummer eller D-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Oppgi fødselsnummer \/ D-nummer/i }).should('exist');

      answerRadio('Har samboer norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByLabelText('Oppgi fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByRole('textbox', { name: /Oppgi fødselsnummer \/ D-nummer/i }).should('not.exist');
    });

    it('shows the samlivsbrudd attachment for the separated branch', () => {
      answerRadio('Hva er din sivilstand?', 'Separert');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Erklæring om samlivsbrudd/ }).should('exist');
    });
  });

  describe('Oppholdstillatelse conditionals', () => {
    beforeEach(() => {
      visitPanel('oppholdstillatelse');
    });

    it('shows citizenship details and the residence-permit attachment for non-Nordic applicants', () => {
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      answerRadio('Er du nordisk statsborger?', 'Nei');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Bekreftelse på oppholdstillatelse/ }).should('exist');
    });
  });

  describe('Barn conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmBarnUnder18ArSomDuHarOmsorgenFor');
    });

    it('shows shared-custody fields and matching Vedlegg attachment', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');

      answerRadio('Har du omsorg for barn under 18 år?', 'Ja');
      fillSharedChildBasics();
      answerRadio('Bor barnet fast sammen med deg?', 'Nei, vi har delt bosted etter barneloven');

      cy.findByLabelText('Har du den daglige omsorgen alene i minst 60% av tiden?').should('exist');
      cy.findByLabelText('Hvordan er delt bosted avtalt?').should('exist');

      answerRadio('Hvordan er delt bosted avtalt?', 'Skriftlig avtale');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Avtale om delt bosted/ }).should('exist');
    });

    it('shows samvær and parent follow-up fields for the relevant row answers', () => {
      answerRadio('Har du omsorg for barn under 18 år?', 'Ja');
      fillSharedChildBasics();
      answerRadio('Bor barnet fast sammen med deg?', 'Ja');
      answerRadio('Har den andre forelderen samvær med barnet?', 'Ja');
      cy.findByLabelText('Har dere skriftlig samværsavtale?').should('exist');

      answerRadio('Har dere skriftlig samværsavtale?', 'Nei');
      cy.findByRole('textbox', { name: 'Beskriv hvordan samværet gjennomføres' }).should('exist');

      fillOtherParentBase();
      answerRadio('Kjenner du til om den andre forelderen har norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByLabelText(/Den andre forelderens fødselsdato/).should('exist');

      answerRadio('Bor den andre forelderen i utlandet?', 'Ja');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt\. postboks/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByLabelText('Har dere bodd sammen i utlandet?').should('exist');
    });
  });

  describe('Opplysninger om utdanningen conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmUtdanningen');
    });

    it('toggles study percentage, education-type fields and cost inputs', () => {
      cy.findByLabelText('Oppgi prosent').should('not.exist');
      cy.findByRole('textbox', { name: 'Klassetrinn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Studiepoeng per semester' }).should('not.exist');
      cy.findByRole('textbox', { name: /^Eksamensgebyr$/ }).should('not.exist');
      cy.findByRole('textbox', { name: /^Semesteravgift$/ }).should('not.exist');

      answerRadio('Studie tid', 'Deltid');
      cy.findByLabelText('Oppgi prosent').should('exist');
      answerRadio('Studie tid', 'Heltid');
      cy.findByLabelText('Oppgi prosent').should('not.exist');

      answerRadio('Type utdanning', 'Videregående skole');
      cy.findByRole('textbox', { name: 'Klassetrinn' }).should('exist');
      cy.findByRole('textbox', { name: 'Studiepoeng per semester' }).should('not.exist');

      answerRadio('Type utdanning', 'Høyere utdanning');
      cy.findByRole('textbox', { name: 'Studiepoeng per semester' }).should('exist');
      cy.findByRole('textbox', { name: 'Klassetrinn' }).should('not.exist');

      setSelectboxesOption(/Hvilke utgifter søker du stønad til/, 'Eksamensgebyr', true);
      cy.findByRole('textbox', { name: /^Eksamensgebyr$/ }).should('exist');
      setSelectboxesOption(/Hvilke utgifter søker du stønad til/, 'Semesteravgift', true);
      cy.findByRole('textbox', { name: /^Semesteravgift$/ }).should('exist');
      setSelectboxesOption(/Hvilke utgifter søker du stønad til/, 'Eksamensgebyr', false);
      cy.findByRole('textbox', { name: /^Eksamensgebyr$/ }).should('not.exist');
    });
  });

  describe('Andre opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('andreOpplysninger');
    });

    it('shows the textarea only when the applicant has extra information', () => {
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('not.exist');

      answerRadio('Har du andre opplysninger til saken?', 'Ja');
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('exist');

      answerRadio('Har du andre opplysninger til saken?', 'Nei');
      cy.findByRole('textbox', { name: 'Andre opplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav150004/soknaden?sub=paper');
    });

    it('fills a happy path and verifies the summary', () => {
      answerRadio('Søker du om stønad til skolepenger fra et bestemt tidspunkt?', 'Nei');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.clickNextStep();

      answerRadio('Hva er din sivilstand?', 'Ugift');
      answerRadio('Deler du bolig med andre voksne?', 'Nei');
      answerRadio('Har du planer om å gifte deg eller bli samboer?', 'Nei');
      cy.clickNextStep();

      answerRadio('Er du nordisk statsborger?', 'Ja');
      answerRadio('Oppholder du deg i Norge?', 'Ja');
      answerRadio('Har du vært bosatt i Norge de siste 5 årene?', 'Ja');
      cy.clickNextStep();

      answerRadio('Har du omsorg for barn under 18 år?', 'Ja');
      fillSharedChildBasics();
      answerRadio('Bor barnet fast sammen med deg?', 'Ja');
      answerRadio('Har den andre forelderen samvær med barnet?', 'Nei');
      fillOtherParentBase();
      answerRadio('Kjenner du til om den andre forelderen har norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.findByLabelText(/Den andre forelderens fødselsdato/).type('01.01.1980');
      answerRadio('Bor den andre forelderen i utlandet?', 'Nei');
      answerRadio('Bor du og den andre forelderen nærme hverandre?', 'Nei');
      answerRadio('Har dere tidligere bodd i samme hus/ leilighet?', 'Nei');
      answerRadio('Tilbringer du tid sammen med den andre forelderen?', 'Nei');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Navn på skole/utdanningssted' }).type('Eksempelskolen');
      cy.findByRole('textbox', { name: 'Navn på utdanning' }).type('Sykepleie');
      cy.findByLabelText('Fra dato (dd.mm.åååå)').type('01.08.2026');
      cy.findByLabelText('Til dato (dd.mm.åååå)').type('30.06.2027');
      answerRadio('Studie tid', 'Heltid');
      answerRadio('Typestudie', 'Offentlig');
      cy.findByRole('textbox', { name: 'Utdanningsmål / yrkesmål' }).type('Autorisert sykepleier');
      answerRadio('Type utdanning', 'Høyere utdanning');
      cy.findByRole('textbox', { name: 'Studiepoeng per semester' }).type('30');
      setSelectboxesOption(/Hvilke utgifter søker du stønad til/, 'Eksamensgebyr', true);
      cy.findByRole('textbox', { name: /^Eksamensgebyr$/ }).type('2500');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre opplysninger' }).click();

      answerRadio('Har du andre opplysninger til saken?', 'Nei');
      cy.findByRole('link', { name: 'Erklæring' }).click();

      cy.findByRole('checkbox', {
        name: /Jeg har gjort meg kjent med vilkårene for å motta skolepenger\./,
      }).click();
      cy.findByRole('checkbox', {
        name: /Jeg er kjent med at jeg må legge ved dokumentasjon som bekrefter opplysningene/i,
      }).click();
      cy.findByRole('checkbox', {
        name: /Jeg er kjent med at mangelfulle eller feilaktige opplysninger kan medføre krav/i,
      }).click();

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.get('#page-title').should('contain.text', 'Vedlegg');
      cy.findByRole('group', { name: /Fødselsattest\/bostedsbevis for barn under 18 år/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon av utdanning det søkes stønad til/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til skolepenger, eksamensgebyr o\.l\./ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Sivilstatus og bosituasjon', () => {
        cy.contains('dt', 'Hva er din sivilstand?').next('dd').should('contain.text', 'Ugift');
      });
      cy.withinSummaryGroup('Opplysninger om barn under 18 år som du har omsorgen for', () => {
        cy.contains('dd', 'Mia').should('exist');
      });
      cy.withinSummaryGroup('Opplysninger om utdanningen', () => {
        cy.contains('dt', 'Navn på utdanning').next('dd').should('contain.text', 'Sykepleie');
      });
    });
  });
});
