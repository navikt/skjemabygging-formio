/*
 * Production form tests for Oppfølgingsplan ved sykmelding
 * Form: nav250201
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): cross-panel trigger to Om arbeidstaker
 *       DetteForsteOppfolgingsplanForDenneSykemeldingenEllerSkalDuOppdatereEnEksisterendeOppfolgingsplan
 *         → vedOppdateringAvPlan (stilling/avdeling section on Om arbeidstaker)
 *   - Om virksomheten (omVirksomheten): 1 same-panel conditional
 *       onskerDuAOppgiEnAnnenKontaktpersonTilNav → annen kontaktperson section (navSkjemagruppe1)
 *   - Om arbeidstaker (omArbeidstaker): 1 same-panel conditional
 *       arbeidstakerHarIkkeTelefonnummer (checkbox) → hides telefonnummer (show=False when checked)
 *   - Tiltak og vurdering (tiltakOgVurdering): 5 same-panel conditionals
 *       OnskerBistandFraNav (ja) → kryssAvOgGiBegrunnelseForOnsketBistand + begrunnelseForOnsketBistand
 *       erDetBehovForBistandFraAndre (ja) → bistandsbehov + spesifiserAnnetBehov
 *       erDetBehovForAvklaringMedLegeSykmelder (ja) → beskrivBehov
 *       erTilrettelagtArbeidIkkeMulig (nei) → hvisNeiBeskrivHvorforDetteIkkeErMulig
 *       radiopanel Videre framdrift (ja) → beskrivHvaSomErPlanlagtFremover
 */

describe('nav250201', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Om virksomheten – annen kontaktperson conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250201/omVirksomheten?sub=paper');
      cy.defaultWaits();
    });

    it('shows annen kontaktperson section when ja is selected', () => {
      // Only main contact section is shown initially
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length', 1);

      cy.withinComponent('Ønsker du å oppgi en annen kontaktperson til Nav?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Both main contact and annen kontaktperson sections are now visible
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length', 2);

      cy.withinComponent('Ønsker du å oppgi en annen kontaktperson til Nav?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length', 1);
    });
  });

  describe('Om arbeidstaker – telefonnummer conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250201/omArbeidstaker?sub=paper');
      cy.defaultWaits();
    });

    it('hides phone number when arbeidstaker has no phone checkbox is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      // navCheckbox is not required so its label includes "(valgfritt)"
      cy.findByRole('checkbox', { name: /Arbeidstaker har ikke telefonnummer/ }).click();

      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Arbeidstaker har ikke telefonnummer/ }).click();

      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Veiledning → Om arbeidstaker – cross-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250201/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows stilling/avdeling section when this is the first followup plan', () => {
      cy.withinComponent(
        'Er dette første oppfølgingsplan for denne sykemeldingen eller skal du oppdatere en eksisterende oppfølgingsplan?',
        () => {
          cy.findByRole('radio', { name: 'Dette er første oppfølgingsplan' }).click();
        },
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om arbeidstaker' }).click();

      cy.findByRole('textbox', { name: 'Stilling / avdeling' }).should('exist');
    });

    it('hides stilling/avdeling section when updating an existing plan', () => {
      cy.withinComponent(
        'Er dette første oppfølgingsplan for denne sykemeldingen eller skal du oppdatere en eksisterende oppfølgingsplan?',
        () => {
          cy.findByRole('radio', { name: 'Jeg skal oppdatere en allerede eksisterende oppfølgingsplan' }).click();
        },
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om arbeidstaker' }).click();

      cy.findByRole('textbox', { name: 'Stilling / avdeling' }).should('not.exist');
    });
  });

  describe('Tiltak og vurdering – NAV assistance conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250201/tiltakOgVurdering?sub=paper');
      cy.defaultWaits();
    });

    it('shows bistand fra NAV fields when ja is selected', () => {
      // Check an individual option to verify the selectboxes group visibility
      cy.findByRole('checkbox', { name: 'Råd og veiledning' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Gi en begrunnelse for ønsket bistand' }).should('not.exist');

      cy.withinComponent('Trenger dere bistand fra NAV?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('checkbox', { name: 'Råd og veiledning' }).should('exist');
      cy.findByRole('textbox', { name: 'Gi en begrunnelse for ønsket bistand' }).should('exist');

      cy.withinComponent('Trenger dere bistand fra NAV?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('checkbox', { name: 'Råd og veiledning' }).should('not.exist');
    });

    it('shows bistand fra andre fields when ja is selected', () => {
      cy.findByRole('group', { name: 'Det er behov for bistand fra' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Beskriv behov for bistand' }).should('not.exist');

      cy.withinComponent('Er det behov for bistand fra andre?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('group', { name: 'Det er behov for bistand fra' }).should('exist');
      cy.findByRole('textbox', { name: 'Beskriv behov for bistand' }).should('exist');

      cy.withinComponent('Er det behov for bistand fra andre?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('group', { name: 'Det er behov for bistand fra' }).should('not.exist');
    });

    it('shows avklaring med lege field when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Beskriv behov for avklaring' }).should('not.exist');

      cy.withinComponent('Er det behov for avklaring med lege/sykmelder?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv behov for avklaring' }).should('exist');

      cy.withinComponent('Er det behov for avklaring med lege/sykmelder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv behov for avklaring' }).should('not.exist');
    });

    it('shows tilrettelegging reason when nei is selected', () => {
      cy.findByRole('textbox', { name: 'Beskriv hvorfor det ikke er mulig å tilrettelegge arbeidet' }).should(
        'not.exist',
      );

      cy.withinComponent('Er det mulig å tilrettelegge arbeidet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv hvorfor det ikke er mulig å tilrettelegge arbeidet' }).should('exist');

      cy.withinComponent('Er det mulig å tilrettelegge arbeidet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv hvorfor det ikke er mulig å tilrettelegge arbeidet' }).should(
        'not.exist',
      );
    });

    it('shows planlagt fremover field when videre framdrift is ja', () => {
      cy.findByRole('textbox', { name: 'Beskriv hva som er planlagt fremover' }).should('not.exist');

      cy.withinComponent('Videre framdrift av tiltaket', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv hva som er planlagt fremover' }).should('exist');

      cy.withinComponent('Videre framdrift av tiltaket', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv hva som er planlagt fremover' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav250201?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Compute today's date for datoForUtfyllingAvSkjemaDdMmAaaa (earliestAllowedDate: 0 = today)
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const todayStr = `${dd}.${mm}.${yyyy}`;

      // Veiledning – date + first plan selected (triggers vedOppdateringAvPlan on Om arbeidstaker)
      cy.findByRole('textbox', { name: /Dato for utfylling/ }).type(todayStr + '{esc}');
      cy.withinComponent(
        'Er dette første oppfølgingsplan for denne sykemeldingen eller skal du oppdatere en eksisterende oppfølgingsplan?',
        () => {
          cy.findByRole('radio', { name: 'Dette er første oppfølgingsplan' }).click();
        },
      );
      cy.clickNextStep();

      // Om virksomheten – fill required fields, no annen kontaktperson
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Underenhetens organisasjonsnummer' }).type('889640782');
      cy.withinComponent('Har virksomheten bedriftshelsetjeneste?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Testsen');
      // phoneNumber may lack aria association – fall back to tel input if needed
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Ønsker du å oppgi en annen kontaktperson til Nav?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Om arbeidstaker – vedOppdateringAvPlan visible (first plan selected above)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Fødselsnummer / D-nummer').type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Stilling / avdeling' }).type('Programvareutvikler');
      cy.findByRole('textbox', { name: 'Beskriv hvilke ordinære arbeidsoppgaver arbeidstaker har til vanlig' }).type(
        'Koding og utvikling av programvare.',
      );
      cy.clickNextStep();

      // Opplysninger om sykefraværet
      cy.findByRole('textbox', { name: /første fraværsdag/ }).type('01.11.2024{esc}');
      cy.findByRole('textbox', { name: /Når var første sykmeldingsdato/ }).type('01.11.2024{esc}');
      cy.findByLabelText('Hva var sykmeldingsprosent ved sykmeldingsdato?').type('100');
      cy.clickNextStep();

      // Tiltak og vurdering – choose nei for all conditional radios to avoid extra required fields
      cy.findByRole('textbox', { name: 'Hvilke ordinære arbeidsoppgaver kan arbeidstaker utføre?' }).type(
        'Hjemmekontor og lettere oppgaver.',
      );
      cy.findByRole('textbox', { name: 'Hvilke ordinære arbeidsoppgaver kan arbeidstaker ikke utføre?' }).type(
        'Tunge løft og kontorarbeid.',
      );
      cy.findByRole('textbox', { name: 'Hvilke tiltak er planlagt?' }).type('Tilrettelegging med hjemmekontor.');
      cy.findByRole('textbox', { name: 'Hva er målet med tiltakene som skal gjennomføres?' }).type(
        'Tilbake i full stilling innen 6 måneder.',
      );
      cy.findByRole('textbox', { name: /Tiltakets startdato/ }).type('01.02.2025{esc}');
      cy.findByRole('textbox', { name: /Tiltakets sluttdato/ }).type('01.08.2025{esc}');
      cy.findByLabelText('Sykmeldingsprosent i perioden').type('50');
      cy.withinComponent('Trenger dere bistand fra NAV?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er det behov for bistand fra andre?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er det behov for avklaring med lege/sykmelder?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er det mulig å tilrettelegge arbeidet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Effekt av tiltaket' }).type('Bedre helse og trivsel.');
      cy.withinComponent('Videre framdrift av tiltaket', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('checkbox', {
        name: /En signert papirkopi av oppfølgingsplanen vil foreligge/,
      }).click();
      cy.clickNextStep();

      // Navigate to Vedlegg via stepper (isAttachmentPanel – skipped by sequential clickNextStep)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om virksomheten', () => {
        cy.get('dt').eq(0).should('contain.text', 'Virksomhetens navn');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Om arbeidstaker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
