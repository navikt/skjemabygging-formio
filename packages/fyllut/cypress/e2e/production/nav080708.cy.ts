/*
 * Production form tests for Legeerklæring ved arbeidsuførhet
 * Form: nav080708
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om pasienten (opplysningerOmPasienten): 7 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker / fodselsdatoDdMmAaaaSoker / borDuINorge
 *       borDuINorge → vegadresseEllerPostboksadresse / utenlandsk adresse
 *       vegadresseEllerPostboksadresse → vegadresse or postboks child fields
 *   - Diagnose og sykdomsopplysninger (diagnoseOgSykdomsopplysninger): 2 same-panel conditionals
 *       erDetEnEllerFlereBidiagnoser → biDiagnoser
 *       navKontoretBorVurdereOmDetErEnYrkesskadeYrkessykdom → skadedatoDdMmAaaa
 *   - Plan for medisinsk utredning og behandling (planForMedisinskUtredningOgBehandling): 4 same-panel conditionals
 *       ikkeAktuelt → hides henvisning and shows begrunnelse
 *       pasientenErHenvistTil.utredning/behandling → utredning/behandling groups
 *       pasientenErHenvistTil.* → narErDetHensiktsmessigAtNavKontoretBerOmNyeLegeopplysninger
 *   - Innspill til NAV om tiltak/aktivitet (innspillTilNavOmTiltakAktivitet): 1 same-panel conditional
 *       erDetMedisinskeGrunnerTilAtTiltakEllerAktivitetIkkeErAktueltNa → beskrivHvorforTiltakIkkeBorGjennomforesNa
 *   - Medisinsk begrunnet vurdering av funksjonsevnen (medisinskBegrunnetVurderingAvFunksjonsevnen): 8 same-panel conditionals
 *       erPasienten=annet → beskrivAnnet
 *       vilPasientenKunneGjenopptaDetTidligereArbeidet → begrunnHvorfor / previous-work or other-work branches
 *       nested arbeidsevne radios → textarea follow-ups
 *   - Samarbeid/kontakt (samarbeidKontakt): 1 same-panel conditional
 *       onskerDuAtNavSkalTaKontaktMedDeg → giEnBegrunnelseForDette
 *   - Forbehold (forbehold): 1 same-panel conditional
 *       erDetNoeILegeerklaeringenSomPasientenIkkeBorFaViteAvMedisinskeGrunner → oppgiHvaPasientenIkkeBorFaVite
 *
 * Note: Vedlegg has isAttachmentPanel=true and only supports leggerVedNaa/nei.
 * Use the "Nei" branch, then one clickNextStep() to reach Oppsummering.
 */

const fillOpplysningerOmPasienten = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har pasienten norsk fødselsnummer eller D-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.withinComponent('Er pasienten kjent?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Er legitimasjon vist?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
};

const fillDiagnosePanel = () => {
  cy.findByRole('textbox', { name: 'Hoveddiagnose' }).type('Testdiagnose');
  cy.findByRole('textbox', { name: 'Kode for hoveddiagnose' }).type('A00');
  cy.withinComponent('Velg diagnose', () => {
    cy.findByRole('radio', { name: 'ICD10' }).click();
  });
  cy.withinComponent('Er det en eller flere bidiagnoser?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByRole('textbox', { name: /Relevant\s+sykehistorie med symptomer og behandling/i }).type(
    'Kort relevant sykehistorie.',
  );
  cy.findByRole('textbox', { name: /Status presens dato/ }).type('01.01.2025');
  cy.findByRole('textbox', { name: /Redegjør for den nåværende medisinske tilstanden/i }).type(
    'Nåværende medisinsk tilstand.',
  );
};

const fillPlanPanel = () => {
  cy.findByRole('group', { name: 'Pasienten er henvist til' }).within(() => {
    cy.findByRole('checkbox', { name: 'Utredning' }).check();
  });
  cy.findByRole('textbox', { name: 'Spesifiser' }).type('Nevrologisk vurdering');
  cy.findByRole('textbox', { name: /^Dato for henvisning \(dd\.mm\.åååå\)$/ }).type('01.02.2025');
  cy.findByLabelText('Antatt uker ventetid').type('6');
  cy.findByRole('textbox', { name: 'Utredning' }).type('Utredning av funksjonsevne');
  cy.findByRole('textbox', { name: 'Tidspunkt - Varighet' }).type('Mars 2025');
  cy.findByRole('textbox', { name: /Når er det hensiktsmessig at NAV-kontoret ber om nye legeopplysninger/ }).type(
    'Om seks uker.',
  );
};

const fillMedisinskVurderingPanel = () => {
  cy.findByRole('textbox', { name: 'Beskriv hvordan sykdom påvirker funksjonsevnen i arbeid og dagligliv' }).type(
    'Funksjonsevnen er redusert i arbeid og dagligliv.',
  );
  cy.withinComponent('Er pasienten', () => {
    cy.findByRole('radio', { name: 'student' }).click();
  });
  cy.findByRole('textbox', { name: 'Beskriv kort type arbeid og hvilke krav som stilles' }).type(
    'Har behov for konsentrasjon og fysisk utholdenhet.',
  );
  cy.withinComponent(
    'Vil pasienten kunne gjenoppta deler av sitt tidligere arbeid eller hele sin fulle stilling?',
    () => {
      cy.findByRole('radio', { name: 'Usikker' }).click();
    },
  );
  cy.findByRole('textbox', { name: 'Begrunn hvorfor' }).type('Behov for videre observasjon.');
};

const fillVedleggPanel = () => {
  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei/ }).click();
  });
};

describe('nav080708', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om pasienten – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708/opplysningerOmPasienten?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr, date of birth, and address branches from Norwegian identity answers', () => {
      cy.findByRole('textbox', { name: /Pasientens fødselsnummer \/ D-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Pasientens fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har pasienten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Pasientens fødselsnummer \/ D-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Pasientens fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har pasienten norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Pasientens fødselsnummer \/ D-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Pasientens fødselsdato/ }).should('exist');

      cy.findAllByRole('radio', { name: 'Ja' }).eq(1).click();
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Postboks/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Land/ }).should('not.exist');

      cy.findByRole('radio', { name: 'Vegadresse' }).click();
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('exist');
      cy.findByRole('textbox', { name: /Postboks/ }).should('not.exist');

      cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Postboks/ }).should('exist');

      cy.findAllByRole('radio', { name: 'Nei' }).eq(1).click();
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Postboks/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Land/ }).should('exist');
      cy.findByRole('textbox', { name: /By \/ stedsnavn/ }).should('exist');
    });
  });

  describe('Diagnose og sykdomsopplysninger – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708/diagnoseOgSykdomsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows bidiagnoser datagrid and skadedato only when their triggers are enabled', () => {
      cy.findByRole('textbox', { name: 'Bi-diagnose' }).should('not.exist');
      cy.findByRole('textbox', { name: /Skadedato/ }).should('not.exist');

      cy.withinComponent('Er det en eller flere bidiagnoser?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Bi-diagnose' }).should('exist');
      cy.findByRole('textbox', { name: 'Kode' }).should('exist');

      cy.withinComponent('Er det en eller flere bidiagnoser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Bi-diagnose' }).should('not.exist');

      cy.findByRole('group', { name: 'NAV-kontoret bør vurdere om det er en yrkesskade/yrkessykdom' })
        .find('input[type="checkbox"]')
        .click();
      cy.findByRole('textbox', { name: /Skadedato/ }).should('exist');

      cy.findByRole('group', { name: 'NAV-kontoret bør vurdere om det er en yrkesskade/yrkessykdom' })
        .find('input[type="checkbox"]')
        .click();
      cy.findByRole('textbox', { name: /Skadedato/ }).should('not.exist');
    });
  });

  describe('Plan for medisinsk utredning og behandling – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708/planForMedisinskUtredningOgBehandling?sub=paper');
      cy.defaultWaits();
    });

    it('toggles utredning, behandling, and follow-up question from selected referrals', () => {
      cy.findByRole('textbox', { name: 'Spesifiser' }).should('not.exist');
      cy.findByRole('textbox', {
        name: /Når er det hensiktsmessig at NAV-kontoret ber om nye legeopplysninger/,
      }).should('not.exist');

      cy.findByRole('group', { name: 'Pasienten er henvist til' }).within(() => {
        cy.findByRole('checkbox', { name: 'Utredning' }).check();
      });
      cy.findByRole('textbox', { name: 'Spesifiser' }).should('exist');
      cy.findByRole('textbox', { name: 'Utredning' }).should('exist');
      cy.findByRole('textbox', { name: 'Behandling' }).should('not.exist');
      cy.findByRole('textbox', {
        name: /Når er det hensiktsmessig at NAV-kontoret ber om nye legeopplysninger/,
      }).should('exist');

      cy.findByRole('group', { name: 'Pasienten er henvist til' }).within(() => {
        cy.findByRole('checkbox', { name: 'Utredning' }).uncheck();
        cy.findByRole('checkbox', { name: 'Behandling' }).check();
      });
      cy.findAllByRole('textbox', { name: 'Spesifiser' }).should('have.length', 1);
      cy.findByRole('textbox', { name: 'Utredning' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Behandling' }).should('exist');
      cy.findByRole('textbox', {
        name: /Når er det hensiktsmessig at NAV-kontoret ber om nye legeopplysninger/,
      }).should('exist');

      cy.findByRole('group', { name: 'Pasienten er henvist til' }).within(() => {
        cy.findByRole('checkbox', { name: 'Behandling' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Spesifiser' }).should('not.exist');
      cy.findByRole('textbox', {
        name: /Når er det hensiktsmessig at NAV-kontoret ber om nye legeopplysninger/,
      }).should('not.exist');
    });

    it('hides henvisning and shows begrunnelse when ikke aktuelt is checked', () => {
      cy.findByRole('group', { name: 'Pasienten er henvist til' }).should('exist');
      cy.findByRole('textbox', { name: /Begrunnelse for hvorfor videre behandling ikke er aktuelt/ }).should(
        'not.exist',
      );

      cy.findByRole('group', { name: 'Ikke aktuelt' }).find('input[type="checkbox"]').click();

      cy.findByRole('group', { name: 'Pasienten er henvist til' }).should('not.exist');
      cy.findByRole('textbox', { name: /Begrunnelse for hvorfor videre behandling ikke er aktuelt/ }).should('exist');

      cy.findByRole('group', { name: 'Ikke aktuelt' }).find('input[type="checkbox"]').click();
      cy.findByRole('group', { name: 'Pasienten er henvist til' }).should('exist');
      cy.findByRole('textbox', { name: /Begrunnelse for hvorfor videre behandling ikke er aktuelt/ }).should(
        'not.exist',
      );
    });
  });

  describe('Innspill til NAV om tiltak/aktivitet – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708/innspillTilNavOmTiltakAktivitet?sub=paper');
      cy.defaultWaits();
    });

    it('shows explanation only when medical reasons make activity not relevant now', () => {
      cy.findByRole('textbox', { name: 'Beskriv hvorfor tiltak ikke bør gjennomføres nå' }).should('not.exist');

      cy.withinComponent('Er det medisinske grunner til at tiltak eller aktivitet ikke er aktuelt nå?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hvorfor tiltak ikke bør gjennomføres nå' }).should('exist');

      cy.withinComponent('Er det medisinske grunner til at tiltak eller aktivitet ikke er aktuelt nå?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hvorfor tiltak ikke bør gjennomføres nå' }).should('not.exist');
    });
  });

  describe('Medisinsk begrunnet vurdering av funksjonsevnen – same-panel conditionals', () => {
    it('shows Beskriv Annet only when patient status is annet', () => {
      cy.visit('/fyllut/nav080708/medisinskBegrunnetVurderingAvFunksjonsevnen?sub=paper');
      cy.defaultWaits();

      cy.findByRole('textbox', { name: 'Beskriv Annet' }).should('not.exist');

      cy.withinComponent('Er pasienten', () => {
        cy.findByRole('radio', { name: 'annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv Annet' }).should('exist');

      cy.withinComponent('Er pasienten', () => {
        cy.findByRole('radio', { name: 'student' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv Annet' }).should('not.exist');
    });

    it('switches between previous-work, other-work, and uncertain branches', () => {
      cy.visit('/fyllut/nav080708/medisinskBegrunnetVurderingAvFunksjonsevnen?sub=paper');
      cy.defaultWaits();

      cy.findByRole('textbox', { name: 'Begrunn hvorfor' }).should('not.exist');
      cy.findByLabelText('Når vil pasienten kunne gjenoppta det tidligere arbeidet eller sin fulle stilling?').should(
        'not.exist',
      );
      cy.findByLabelText('Vil pasienten kunne ta annet arbeid?').should('not.exist');

      cy.withinComponent(
        'Vil pasienten kunne gjenoppta deler av sitt tidligere arbeid eller hele sin fulle stilling?',
        () => {
          cy.findByRole('radio', { name: 'Usikker' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Begrunn hvorfor' }).should('exist');
      cy.findByLabelText('Når vil pasienten kunne gjenoppta det tidligere arbeidet eller sin fulle stilling?').should(
        'not.exist',
      );
      cy.findByLabelText('Vil pasienten kunne ta annet arbeid?').should('not.exist');

      cy.withinComponent(
        'Vil pasienten kunne gjenoppta deler av sitt tidligere arbeid eller hele sin fulle stilling?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Begrunn hvorfor' }).should('not.exist');
      cy.findByLabelText('Når vil pasienten kunne gjenoppta det tidligere arbeidet eller sin fulle stilling?').should(
        'exist',
      );
      cy.findByLabelText('Er det noe pasienten ikke kan gjøre i det nåværende arbeidet?').should('exist');
      cy.findByLabelText('Vil pasienten kunne ta annet arbeid?').should('not.exist');

      cy.withinComponent('Er det noe pasienten ikke kan gjøre i det nåværende arbeidet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva kan pasienten ikke gjøre i det nåværende arbeidet?' }).should('exist');

      cy.withinComponent('Er det noe pasienten ikke kan gjøre i det nåværende arbeidet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva kan pasienten ikke gjøre i det nåværende arbeidet?' }).should('not.exist');

      cy.withinComponent(
        'Vil pasienten kunne gjenoppta deler av sitt tidligere arbeid eller hele sin fulle stilling?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByLabelText('Når vil pasienten kunne gjenoppta det tidligere arbeidet eller sin fulle stilling?').should(
        'not.exist',
      );
      cy.findByLabelText('Er det noe pasienten ikke kan gjøre i det nåværende arbeidet?').should('not.exist');
      cy.findByLabelText('Vil pasienten kunne ta annet arbeid?').should('exist');

      cy.withinComponent('Vil pasienten kunne ta annet arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når vil pasienten kunne ta annet arbeid?').should('exist');
      cy.findByLabelText('Må det tas andre hensyn ved valg av annet yrke/arbeid?').should('exist');

      cy.withinComponent('Må det tas andre hensyn ved valg av annet yrke/arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hvilke andre hensyn må tas ved valg av annet yrke\/arbeid\?/i }).should(
        'exist',
      );

      cy.withinComponent('Må det tas andre hensyn ved valg av annet yrke/arbeid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Hvilke andre hensyn må tas ved valg av annet yrke\/arbeid\?/i }).should(
        'not.exist',
      );
    });
  });

  describe('Samarbeid/kontakt – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708/samarbeidKontakt?sub=paper');
      cy.defaultWaits();
    });

    it('shows justification only when NAV contact is requested', () => {
      cy.findByRole('textbox', { name: 'Gi en begrunnelse for dette.' }).should('not.exist');

      cy.withinComponent('Ønsker du at NAV skal ta kontakt med deg?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Gi en begrunnelse for dette.' }).should('exist');

      cy.withinComponent('Ønsker du at NAV skal ta kontakt med deg?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Gi en begrunnelse for dette.' }).should('not.exist');
    });
  });

  describe('Forbehold – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708/forbehold?sub=paper');
      cy.defaultWaits();
    });

    it('shows reservation explanation only when the doctor withholds information', () => {
      cy.findByRole('textbox', { name: 'Oppgi hva pasienten ikke bør få vite' }).should('not.exist');

      cy.withinComponent('Er det noe i legeerklæringen som pasienten ikke bør få vite av medisinske grunner?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi hva pasienten ikke bør få vite' }).should('exist');

      cy.withinComponent('Er det noe i legeerklæringen som pasienten ikke bør få vite av medisinske grunner?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi hva pasienten ikke bør få vite' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080708?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Erklæringen gjelder
      cy.withinComponent('Hva gjelder erklæringen?', () => {
        cy.findByRole('radio', { name: 'Sykepenger' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om pasienten
      fillOpplysningerOmPasienten();
      cy.clickNextStep();

      // Pasientens arbeidsforhold
      cy.findByRole('textbox', { name: 'Yrke' }).type('Saksbehandler');
      cy.clickNextStep();

      // Diagnose og sykdomsopplysninger
      fillDiagnosePanel();
      cy.clickNextStep();

      // Plan for medisinsk utredning og behandling
      fillPlanPanel();
      cy.clickNextStep();

      // Innspill til NAV om tiltak/aktivitet
      cy.withinComponent('Er det medisinske grunner til at tiltak eller aktivitet ikke er aktuelt nå?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hvorfor tiltak ikke bør gjennomføres nå' }).type(
        'Tiltak bør avvente videre utredning.',
      );
      cy.clickNextStep();

      // Medisinsk begrunnet vurdering av funksjonsevnen
      fillMedisinskVurderingPanel();
      cy.clickNextStep();

      // Prognose
      cy.withinComponent('Antar du at behandlingen vil føre til bedring av funksjonsevnen sett opp mot arbeid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Anslå varigheten av sykdom, skade' }).type('Tre måneder.');
      cy.findByRole('textbox', { name: 'Anslå varigheten av funksjonsnedsettelsen sett opp mot arbeid' }).type(
        'Seks måneder.',
      );
      cy.clickNextStep();

      // Andre opplysninger – no required fields
      cy.clickNextStep();

      // Samarbeid/kontakt
      cy.withinComponent('Ønsker du at NAV skal ta kontakt med deg?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Forbehold
      cy.withinComponent('Er det noe i legeerklæringen som pasienten ikke bør få vite av medisinske grunner?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Signerende lege
      cy.findByRole('textbox', { name: 'Legens fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Legens etternavn' }).type('Lege');
      cy.findByLabelText('HPR-nummer').type('1234567');
      cy.clickNextStep();

      // Vedlegg
      fillVedleggPanel();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Erklæringen gjelder', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva gjelder erklæringen?');
        cy.get('dd').eq(0).should('contain.text', 'Sykepenger');
      });
      cy.withinSummaryGroup('Opplysninger om pasienten', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Signerende lege', () => {
        cy.get('dt').eq(0).should('contain.text', 'Legens fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
