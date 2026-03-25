/*
 * Production form tests for Søknad om dagpenger under etablering av egen virksomhet
 * Form: nav040608
 * Submission types: PAPER, DIGITAL — using PAPER
 *
 * Panels tested:
 *   - Ditt etableringsprosjekt (dittEtableringsprosjekt): 2 conditionals
 *       harDuSoktOmEtblererstipendFraInnovasjonNorge → angiStatusForSoknaden (show when 'ja')
 *       erVirksomhetenBasertPaProvisjon → beskrivProvisjonssalget (custom, show when 'ja100' or 'jaDelvis')
 *   - Øvrige deltakere i etableringsprosjektet (ovrigeDeltakereIProsjektet): 6 conditionals
 *       erDetFlereDeltakereMedIEtableringsprosjektet → datagrid (show when 'ja')
 *       datagrid row: harDuNorskFodselsnummerEllerDNummer1 → fnrfield (show when 'ja')
 *       datagrid row: harDuNorskFodselsnummerEllerDNummer1 → fødselsdato (show when 'nei')
 *       datagrid row: harDuNorskFodselsnummerEllerDNummer1 → borDuINorge1 (show when 'nei')
 *       datagrid row: borDuINorge1 → norskVegadresse1 container (show when 'ja')
 *       datagrid row: borDuINorge1 → utenlandskAdresse container (show when 'nei')
 *   - Opplysninger om prosjektet (opplysningerOmProsjektet): 3 conditionals
 *       tarDuDereMedKunder... → beskrivKundemasse... (show when 'ja')
 *       erVirksomhetenHeltNy → beskrivVirksomhetenFremTilNa (show when 'nei')
 *       erVirksomhetenEnVidereforingAvNoe... → beskrivOmfangetAv... (show when 'ja')
 *   - Produksjon (produksjon): 2 conditionals (mutually exclusive dates)
 *       erVirksomhetenAlleredeStartetOpp → narBleVirksomhetenStartetOpp (show when 'ja')
 *       erVirksomhetenAlleredeStartetOpp → narForventerDu... (show when 'nei')
 *   - Firmaet / virksomheten (firmaetVirksomheten): 3 conditionals
 *       erBedriftenRegistrertIBronnoysundregisteret → bedriftensOrganisasjonsnummer (show when 'ja')
 *       erDetBestemtHvaBedriftensNavnSkalVaere → bedriftensNavn (show when 'ja')
 *       erDuIlagtEnKonkurskarantene → beskrivDetteNaermere (show when 'ja')
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 custom cross-panel conditional
 *       angiStatusForSoknaden → kopiAvVedtak (show when 'soknadenErInnvilget' or 'soknadenErAvslatt')
 */

describe('nav040608', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Ditt etableringsprosjekt conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608/dittEtableringsprosjekt?sub=paper');
      cy.defaultWaits();
    });

    it('shows angiStatusForSoknaden when harDuSoktOmEtblererstipend is ja', () => {
      cy.findByLabelText('Angi status for søknaden').should('not.exist');

      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Angi status for søknaden').should('exist');

      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Angi status for søknaden').should('not.exist');
    });

    it('shows beskrivProvisjonssalget when erVirksomhetenBasertPaProvisjon is ja100 or jaDelvis', () => {
      cy.findByRole('textbox', { name: 'Beskriv provisjonssalget' }).should('not.exist');

      cy.withinComponent('Er virksomheten basert på provisjon?', () => {
        cy.findByRole('radio', { name: 'Ja, 100%' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv provisjonssalget' }).should('exist');

      cy.withinComponent('Er virksomheten basert på provisjon?', () => {
        cy.findByRole('radio', { name: 'Ja, delvis' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv provisjonssalget' }).should('exist');

      cy.withinComponent('Er virksomheten basert på provisjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv provisjonssalget' }).should('not.exist');
    });
  });

  describe('Øvrige deltakere conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608/ovrigeDeltakereIProsjektet?sub=paper');
      cy.defaultWaits();
    });

    it('shows datagrid when erDetFlereDeltakere is ja', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('toggles fnr/fødselsdato/borDuINorge in datagrid row based on harDuNorskFodselsnummerEllerDNummer1', () => {
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Initially fnr, date and borDuINorge are not shown
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Deltakers fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor deltaker i Norge?').should('not.exist');

      // Select Ja → fnr shows, date and borDuINorge hidden
      cy.withinComponent('Kan du oppgi deltakerens fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').should('exist');
      cy.findByRole('textbox', { name: /Deltakers fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor deltaker i Norge?').should('not.exist');

      // Select Nei → date and borDuINorge show, fnr hidden
      cy.withinComponent('Kan du oppgi deltakerens fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByRole('textbox', { name: /Deltakers fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor deltaker i Norge?').should('exist');
    });

    it('toggles norsk/utenlandsk address in datagrid row based on borDuINorge1', () => {
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Kan du oppgi deltakerens fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('not.exist');

      cy.withinComponent('Bor deltaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('not.exist');

      cy.withinComponent('Bor deltaker i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('exist');
    });
  });

  describe('Opplysninger om prosjektet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608/opplysningerOmProsjektet?sub=paper');
      cy.defaultWaits();
    });

    it('shows beskrivKundemasse when tarDuDereMedKunder is ja', () => {
      cy.findByRole('textbox', {
        name: /Beskriv kundemasse dette dreier seg om/,
      }).should('not.exist');

      cy.withinComponent(/Tar du \/ dere med kunder fra en allerede etablert virksomhet/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', {
        name: /Beskriv kundemasse dette dreier seg om/,
      }).should('exist');

      cy.withinComponent(/Tar du \/ dere med kunder fra en allerede etablert virksomhet/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', {
        name: /Beskriv kundemasse dette dreier seg om/,
      }).should('not.exist');
    });

    it('shows beskrivVirksomhetenFremTilNa when erVirksomhetenHeltNy is nei', () => {
      cy.findByRole('textbox', { name: 'Beskriv virksomheten frem til nå' }).should('not.exist');

      cy.withinComponent('Er virksomheten helt ny?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv virksomheten frem til nå' }).should('exist');

      cy.withinComponent('Er virksomheten helt ny?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv virksomheten frem til nå' }).should('not.exist');
    });

    it('shows beskrivOmfangetAv when erVirksomhetenEnVidereforingAvNoe is ja', () => {
      cy.findByRole('textbox', { name: /Beskriv omfanget av det du tidligere har utført/ }).should('not.exist');

      cy.withinComponent(/Er virksomheten en videreføring av noe du har drevet med tidligere/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv omfanget av det du tidligere har utført/ }).should('exist');

      cy.withinComponent(/Er virksomheten en videreføring av noe du har drevet med tidligere/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv omfanget av det du tidligere har utført/ }).should('not.exist');
    });
  });

  describe('Produksjon conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608/produksjon?sub=paper');
      cy.defaultWaits();
    });

    it('shows oppstartsdato when erVirksomhetenAlleredeStartetOpp is ja, forventet dato when nei', () => {
      cy.findByRole('textbox', { name: /Når ble virksomheten.*startet opp/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Når forventer du at virksomheten/ }).should('not.exist');

      cy.withinComponent('Er virksomheten allerede startet opp?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Når ble virksomheten.*startet opp/ }).should('exist');
      cy.findByRole('textbox', { name: /Når forventer du at virksomheten/ }).should('not.exist');

      cy.withinComponent('Er virksomheten allerede startet opp?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Når ble virksomheten.*startet opp/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Når forventer du at virksomheten/ }).should('exist');
    });
  });

  describe('Firmaet / virksomheten conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608/firmaetVirksomheten?sub=paper');
      cy.defaultWaits();
    });

    it('shows organisasjonsnummer when erBedriftenRegistrert is ja', () => {
      cy.findByLabelText('Bedriftens organisasjonsnummer').should('not.exist');

      cy.withinComponent('Er bedriften registrert i Brønnøysundregisteret?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bedriftens organisasjonsnummer').should('exist');

      cy.withinComponent('Er bedriften registrert i Brønnøysundregisteret?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bedriftens organisasjonsnummer').should('not.exist');
    });

    it('shows bedriftensNavn when erDetBestemtHvaBedriftensNavnSkalVaere is ja', () => {
      cy.findByRole('textbox', { name: /Bedriftens navn/ }).should('not.exist');

      cy.withinComponent('Er det bestemt hva bedriftens navn skal være?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Bedriftens navn/ }).should('exist');

      cy.withinComponent('Er det bestemt hva bedriftens navn skal være?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Bedriftens navn/ }).should('not.exist');
    });

    it('shows beskrivDetteNaermere when erDuIlagtEnKonkurskarantene is ja', () => {
      cy.findByRole('textbox', { name: 'Beskriv dette nærmere' }).should('not.exist');

      cy.withinComponent('Er du ilagt en konkurskarantene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv dette nærmere' }).should('exist');

      cy.withinComponent('Er du ilagt en konkurskarantene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv dette nærmere' }).should('not.exist');
    });
  });

  describe('Vedlegg cross-panel conditional (kopiAvVedtak)', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608/dittEtableringsprosjekt?sub=paper');
      cy.defaultWaits();
    });

    it('shows kopiAvVedtak on vedlegg when angiStatusForSoknaden is innvilget or avslatt', () => {
      // Set trigger: harDuSoktOmEtblererstipend = ja, then angiStatus = innvilget
      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Angi status for søknaden', () => {
        cy.findByRole('radio', { name: 'Søknaden er innvilget.' }).click();
      });

      // Navigate to vedlegg via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Kopi av vedtak om etablererstipend/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040608?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // landing page → first panel (Veiledning)
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Kommune' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Ditt etableringsprosjekt — pick 'nei' for stipend (skip angiStatus), 'nei' for provisjon
      cy.findByRole('textbox', { name: 'Beskriv ditt etableringsprosjekt' }).type('Etablering av testtjeneste');
      cy.withinComponent('Har du søkt om etablererstipend fra Innovasjon Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er virksomheten basert på provisjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Øvrige deltakere — pick 'nei' to skip datagrid
      cy.withinComponent('Er det flere deltakere med i etableringsprosjektet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om prosjektet — pick values that hide optional textareas
      cy.withinComponent('Innebærer etableringen overtakelse / kjøp av allerede etablert virksomhet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Tar du \/ dere med kunder fra en allerede etablert virksomhet/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er virksomheten helt ny?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Er virksomheten en videreføring av noe du har drevet med tidligere/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Plan for etablering
      cy.findByRole('textbox', {
        name: /Hvordan har du \/ dere har planlagt å etablere virksomheten/,
      }).type('Trinnvis plan');
      cy.clickNextStep();

      // Produksjon — pick 'ja' (already started)
      cy.withinComponent('Er virksomheten allerede startet opp?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Når ble virksomheten.*startet opp/ }).type('01.01.2025');
      cy.clickNextStep();

      // Firmaet / virksomheten
      cy.withinComponent('Er bedriften registrert i Brønnøysundregisteret?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bedriftens organisasjonsnummer').type('889640782');
      cy.withinComponent('Er det bestemt hva bedriftens navn skal være?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Bedriftens navn/ }).type('Test AS');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText(/Din prosentvise eierandel/).type('100');
      cy.withinComponent('Angi selskapsform', () => {
        cy.findByRole('radio', { name: 'Personlig selskap' }).click();
      });
      cy.withinComponent('Er du ilagt en konkurskarantene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg — isAttachmentPanel=true: use stepper to navigate there
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Næringsfaglig vurdering av etableringsplaner/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/i }).click();
      });

      // Vedlegg is the last panel → one clickNextStep() reaches Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Ditt etableringsprosjekt', () => {
        cy.get('dt').eq(0).should('contain.text', 'Beskriv ditt etableringsprosjekt');
        cy.get('dd').eq(0).should('contain.text', 'Etablering av testtjeneste');
      });
      cy.withinSummaryGroup('Produksjon', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er virksomheten allerede startet opp?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
