/*
 * Production form tests for Legeerklæring for motorkjøretøy
 * Form: nav100742
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Legeerklæring (legeerklaering): 9 same-panel conditionals
 *       tilfredsstillerBrukerKravene → giEnFagligBegrunnelse (show when 'nei')
 *       kanSokerenAlene...TogBuss → kanSokerenMedFolge...TogBuss (show when 'nei')
 *       kanSokerenMedFolge...TogBuss → beskrivHvorfor...MedFolge (show when 'nei')
 *       kanSokerenAlene...Drosje → kanSokerenMedFolge...Drosje (show when 'nei')
 *       kanSokerenMedFolge...Drosje → beskrivHvorforDrosje (show when 'nei')
 *       erPsykiskeLidelser → harSokerenForsoktEksponeringsterapi (show when 'ja')
 *       harSokerenForsoktEksponeringsterapi → beskrivHvilkeTiltak (show when 'ja')
 *       harSokerenForsoktEksponeringsterapi → forklarHvorforPasient (show when 'nei')
 *       + 1 cross-panel trigger to Vedlegg (harSokerenForsoktEksponeringsterapi 'ja')
 *   - Vedlegg (vedlegg): isAttachmentPanel, attachment conditionally required when eksponeringsterapi='ja'
 */

describe('nav100742', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Legeerklæring – tilfredsstiller kravene', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100742/legeerklaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows begrunnelse only when søker ikke tilfredsstiller kravene', () => {
      cy.findByLabelText('Gi en faglig begrunnelse for hvorfor søker ikke tilfredsstiller kravene').should('not.exist');

      cy.withinComponent(
        'Tilfredsstiller bruker kravene som stilles i førerkortforskriften for å være fører av motorkjøretøy?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText('Gi en faglig begrunnelse for hvorfor søker ikke tilfredsstiller kravene').should('exist');

      cy.withinComponent(
        'Tilfredsstiller bruker kravene som stilles i førerkortforskriften for å være fører av motorkjøretøy?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText('Gi en faglig begrunnelse for hvorfor søker ikke tilfredsstiller kravene').should('not.exist');
    });
  });

  describe('Legeerklæring – kollektivtransport chain conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100742/legeerklaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows med-følge question only when søker ikke kan reise kollektivt alene', () => {
      cy.findByLabelText(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler, hvis hen har følge?',
      ).should('not.exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler alene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler, hvis hen har følge?',
      ).should('exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler alene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler, hvis hen har følge?',
      ).should('not.exist');
    });

    it('shows kollektivt beskrivelse only when søker heller ikke kan reise kollektivt med følge', () => {
      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler alene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText('Beskriv hvorfor søkeren ikke kan reise kollektivt hvis hen har med følge').should(
        'not.exist',
      );

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler, hvis hen har følge?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText('Beskriv hvorfor søkeren ikke kan reise kollektivt hvis hen har med følge').should('exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler, hvis hen har følge?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText('Beskriv hvorfor søkeren ikke kan reise kollektivt hvis hen har med følge').should(
        'not.exist',
      );
    });
  });

  describe('Legeerklæring – drosje/spesialtransport chain conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100742/legeerklaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows med-følge question only when søker ikke kan reise med drosje alene', () => {
      cy.findByLabelText(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport hvis hen har med følge?',
      ).should('not.exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport alene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport hvis hen har med følge?',
      ).should('exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport alene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport hvis hen har med følge?',
      ).should('not.exist');
    });

    it('shows drosje beskrivelse only when søker heller ikke kan reise med drosje med følge', () => {
      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport alene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText(
        'Beskriv hvorfor søkeren ikke kan reise med drosje eller spesialtransport hvis hen har med følge',
      ).should('not.exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport hvis hen har med følge?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText(
        'Beskriv hvorfor søkeren ikke kan reise med drosje eller spesialtransport hvis hen har med følge',
      ).should('exist');

      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport hvis hen har med følge?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText(
        'Beskriv hvorfor søkeren ikke kan reise med drosje eller spesialtransport hvis hen har med følge',
      ).should('not.exist');
    });
  });

  describe('Legeerklæring – psykiske lidelser og eksponeringsterapi', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100742/legeerklaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows eksponeringsterapi question only when psykiske lidelser er til hinder', () => {
      cy.findByLabelText('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?').should(
        'not.exist',
      );

      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?').should('exist');

      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?').should(
        'not.exist',
      );
    });

    it('shows tiltaksbeskrivelse when eksponeringsterapi er forsøkt', () => {
      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Beskriv hvilke tiltak som er gjennomført og resultatet av disse tiltakene').should(
        'not.exist',
      );

      cy.withinComponent('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Beskriv hvilke tiltak som er gjennomført og resultatet av disse tiltakene').should('exist');
    });

    it('shows forklaring when eksponeringsterapi ikke er forsøkt', () => {
      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Forklar hvorfor pasienten ikke har forsøkt eksponeringsterapi').should('not.exist');

      cy.withinComponent('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Forklar hvorfor pasienten ikke har forsøkt eksponeringsterapi').should('exist');
    });
  });

  describe('Vedlegg – conditional attachment from eksponeringsterapi', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100742/legeerklaering?sub=paper');
      cy.defaultWaits();
    });

    it('shows spesialisterklæring attachment when eksponeringsterapi er forsøkt', () => {
      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Spesialisterklæring fra klinisk psykolog eller psykiater').should('exist');
    });

    it('shows attachment requirement info only when eksponeringsterapi er forsøkt', () => {
      cy.findByText('Du må legge ved spesialisterklæring fra klinisk psykolog eller psykiater.').should('not.exist');

      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByText('Du må legge ved spesialisterklæring fra klinisk psykolog eller psykiater.').should('exist');

      cy.withinComponent('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByText('Du må legge ved spesialisterklæring fra klinisk psykolog eller psykiater.').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100742/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields, handles vedlegg and verifies summary', () => {
      // Legens opplysninger (dineOpplysninger panel)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Lars');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Lege');
      cy.findByLabelText('Telefonnummer').type('87654321');
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Legegata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Opplysninger om søker
      cy.findByLabelText('Fødselsnummer / D-nummer').type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.clickNextStep();

      // Legeerklæring – valid path with conditional attachment requirement
      cy.withinComponent(
        'Tilfredsstiller bruker kravene som stilles i førerkortforskriften for å være fører av motorkjøretøy?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent(
        'Er det mer enn 50 prosent sannsynlig at bruker oppfyller kravene i førerkortforskriften om to år?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med tog, buss eller andre kollektive transportmidler alene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent(
        'Kan søkeren, ut ifra en medisinsk vurdering, reise med drosje eller spesiell transport alene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Er søker i stand til å gå?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er vedkommende avhengig av heis eller rampe for å komme seg inn og ut av kjøretøyet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er psykiske lidelser til hinder for å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Beskriv hvilke tiltak som er gjennomført og resultatet av disse tiltakene').type(
        'Eksponeringsterapi er forsøkt over tid uten tilstrekkelig effekt.',
      );
      cy.findByText('Du må legge ved spesialisterklæring fra klinisk psykolog eller psykiater.').should('exist');
      cy.findByLabelText(
        'Gi en konkret beskrivelse av sykdommen eller skaden, og hva som er den direkte årsaken til at brukeren ikke kan bruke offentlig transportmidler',
      ).type('Pasienten har nedsatt bevegelsesevne.');
      cy.clickNextStep();

      // Vedlegg – attachment panel is shown before Oppsummering
      cy.findByRole('group', {
        name: /Spesialisterklæring fra klinisk psykolog eller psykiater/,
      }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Legens opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Lars');
      });
      cy.withinSummaryGroup('Opplysninger om søker', () => {
        cy.contains('dt', 'Fødselsnummer')
          .next('dd')
          .should(($value) => {
            expect($value.text().replace(/\s/g, '')).to.equal('17912099997');
          });
      });
      cy.withinSummaryGroup('Legeerklæring', () => {
        cy.contains('dt', 'Har søkeren forsøkt eksponeringsterapi for å trene på å reise kollektivt?')
          .next('dd')
          .should('contain.text', 'Ja');
      });
    });
  });
});
