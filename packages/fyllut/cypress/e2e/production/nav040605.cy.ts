/*
 * Production form tests for Søknad om å beholde dagpengene mens du tar utdanning eller opplæring
 * Form: nav040605
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dinOpplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet visibility
 *       identitet.harDuFodselsnummer → alertstripe visibility
 *   - Utdanning eller opplæring (utdanningEllerOpplaering): 8 panel-level conditionals
 *       velgUtdanning → one education-specific panel at a time
 *   - Videregående skole (videregaendeSkole): 1 same-panel conditional
 *       tarDuUtdanningPaFulltid → hvilkeFagTarDu
 *   - Doktorgrad (doktorgrad): 2 same-panel conditionals
 *       jobberDuMedDoktorgradenPaFulltid → harDuMidlertidigAvbruttDoktorgraden → harDuLevertAvhandlingen
 *   - Kurs eller annen opplæring (andreKurs): 1 same-panel conditional
 *       tarDuUtdanningPaFulltid1 → hvorStorErDenTotaleBelastningen
 *   - Norsk med samfunnskunnskap for voksne innvandrere (norskMedSamfunnskunnskapForVoksne): 2 same-panel conditionals
 *       harDuGjennomfortNorskMedSamfunnskunnskapTidligere → mottokDuDagpenger...
 *       mottokDuDagpenger... → brukteDuTotaltEtArEllerMer...
 *   - Erklæring (erklaering): 4 cross-panel customConditionals from utdanning panels
 *       grunnskole / videregaende fullført-status → special or default declaration checkboxes
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 7 cross-panel conditionals from velgUtdanning
 *       selected education type → matching documentation attachment
 */

const submission = '?sub=paper';

const educationPanels = [
  {
    option: 'Grunnskole',
    panelTitle: 'Grunnskole',
    attachmentLabel: /Dokumentasjon på at du tar grunnskoleopplæring/,
  },
  {
    option: 'Videregående skole',
    panelTitle: 'Videregående skole',
    attachmentLabel: /Dokumentasjon på at du tar videregående opplæring/,
  },
  {
    option: 'Fagskole',
    panelTitle: 'Fagskole',
    attachmentLabel: /Dokumentasjon på at du tar utdanning på fagskole/,
  },
  {
    option: 'Høyskole eller universitet',
    panelTitle: 'Høyskole / universitet',
    attachmentLabel: /Dokumentasjon på at du tar utdanning på høyskole eller universitet/,
  },
  {
    option: 'Doktorgrad',
    panelTitle: 'Doktorgrad',
    attachmentLabel: /Dokumentasjon på at du tar doktorgradsutdanning/,
  },
  {
    option: 'Norsk med samfunnskunnskap for voksne innvandrere',
    panelTitle: 'Norsk med samfunnskunnskap for voksne innvandrere',
    attachmentLabel: /Dokumentasjon på at du tar norsk med samfunnskunnskap/,
  },
  {
    option: 'Introduksjonsprogrammet for nyankomne innvandrere',
    panelTitle: 'Introduksjonsprogrammet for nyankomne innvandrere',
    attachmentLabel: null,
  },
  {
    option: 'Kurs eller annen opplæring',
    panelTitle: 'Kurs eller annen opplæring',
    attachmentLabel: /Dokumentasjon på at du tar kurs eller annen opplæring/,
  },
] as const;

const selectEducation = (option: string) => {
  cy.withinComponent('Velg utdanning eller opplæring', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

describe('nav040605', () => {
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
      cy.visit(`/fyllut/nav040605/dinOpplysninger${submission}`);
      cy.defaultWaits();
    });

    it('shows address section when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('shows address validity only when the visible address path requires it and shows the folkeregister alert for Norwegian fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
      cy.findByText(/Nav sender svar på søknad/).should('exist');
    });
  });

  describe('Utdanning eller opplæring panel-level conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('shows only the selected education panel in the stepper', () => {
      educationPanels.forEach(({ option, panelTitle }) => {
        selectEducation(option);

        educationPanels.forEach(({ panelTitle: otherPanelTitle }) => {
          cy.findAllByRole('link', { name: otherPanelTitle }).should(
            otherPanelTitle === panelTitle ? 'have.length.at.least' : 'have.length',
            otherPanelTitle === panelTitle ? 1 : 0,
          );
        });
      });
    });
  });

  describe('Videregående skole conditional', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
      selectEducation('Videregående skole');
      cy.clickNextStep();
    });

    it('shows fag textarea only when education is not full-time', () => {
      cy.findByRole('textbox', { name: 'Hvilke(t) fag tar du?' }).should('not.exist');

      cy.withinComponent('Tar du utdanning på fulltid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilke(t) fag tar du?' }).should('exist');

      cy.withinComponent('Tar du utdanning på fulltid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilke(t) fag tar du?' }).should('not.exist');
    });
  });

  describe('Doktorgrad conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
      selectEducation('Doktorgrad');
      cy.clickNextStep();
    });

    it('shows the follow-up questions only for the non-full-time non-paused path', () => {
      cy.findByLabelText('Har du midlertidig avbrutt doktorgraden?').should('not.exist');
      cy.findByLabelText('Har du levert avhandlingen?').should('not.exist');

      cy.withinComponent('Jobber du med doktorgraden på fulltid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har du midlertidig avbrutt doktorgraden?').should('exist');
      cy.findByLabelText('Har du levert avhandlingen?').should('not.exist');

      cy.withinComponent('Har du midlertidig avbrutt doktorgraden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har du levert avhandlingen?').should('exist');

      cy.withinComponent('Har du midlertidig avbrutt doktorgraden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Har du levert avhandlingen?').should('not.exist');

      cy.withinComponent('Jobber du med doktorgraden på fulltid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Har du midlertidig avbrutt doktorgraden?').should('not.exist');
    });
  });

  describe('Kurs eller annen opplæring conditional', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
      selectEducation('Kurs eller annen opplæring');
      cy.clickNextStep();
    });

    it('shows the workload field only when the course is not full-time', () => {
      cy.findByRole('textbox', {
        name: 'Hvor mange timer forventer kursarrangøren at du skal bruke på kurset og hjemmearbeid totalt?',
      }).should('not.exist');

      cy.withinComponent('Tar du utdanning på fulltid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Hvor mange timer forventer kursarrangøren at du skal bruke på kurset og hjemmearbeid totalt?',
      }).should('exist');

      cy.withinComponent('Tar du utdanning på fulltid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Hvor mange timer forventer kursarrangøren at du skal bruke på kurset og hjemmearbeid totalt?',
      }).should('not.exist');
    });
  });

  describe('Norsk med samfunnskunnskap conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
      selectEducation('Norsk med samfunnskunnskap for voksne innvandrere');
      cy.clickNextStep();
    });

    it('shows the follow-up questions only for the previous-course path', () => {
      cy.findByLabelText(
        'Mottok du dagpenger samtidig som du tok norsk samfunnskunnskap for voksne innvandrere?',
      ).should('not.exist');
      cy.findByLabelText('Brukte du mer enn 1 år da du tok norsk med samfunnskunnskap for voksne innvandrere?').should(
        'not.exist',
      );

      cy.withinComponent('Har du tatt norsk med samfunnskunnskap for voksne innvandrere tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(
        'Mottok du dagpenger samtidig som du tok norsk samfunnskunnskap for voksne innvandrere?',
      ).should('exist');

      cy.withinComponent(
        'Mottok du dagpenger samtidig som du tok norsk samfunnskunnskap for voksne innvandrere?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByLabelText('Brukte du mer enn 1 år da du tok norsk med samfunnskunnskap for voksne innvandrere?').should(
        'exist',
      );

      cy.withinComponent(
        'Mottok du dagpenger samtidig som du tok norsk samfunnskunnskap for voksne innvandrere?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByLabelText('Brukte du mer enn 1 år da du tok norsk med samfunnskunnskap for voksne innvandrere?').should(
        'not.exist',
      );

      cy.withinComponent('Har du tatt norsk med samfunnskunnskap for voksne innvandrere tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(
        'Mottok du dagpenger samtidig som du tok norsk samfunnskunnskap for voksne innvandrere?',
      ).should('not.exist');
    });
  });

  describe('Erklæring cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
    });

    it('switches between special and default declaration checkboxes based on education path', () => {
      selectEducation('Grunnskole');
      cy.clickNextStep();
      cy.withinComponent('Har du tidligere fullført grunnskolen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg vil fortsette å søke jobb som kan kombineres med utdanningen min.',
      }).should('exist');
      cy.findByRole('checkbox', {
        name: 'Jeg vil takke ja hvis jeg får tilbud om jobb eller tiltak i regi av Nav som kan kombineres med utdanningen min.',
      }).should('exist');
      cy.findByRole('checkbox', {
        name: /Jeg vil fortsette å søke jobb mens jeg tar utdanning eller opplæring/,
      }).should('not.exist');
      cy.findByRole('checkbox', {
        name: 'Jeg vil takke ja hvis jeg får tilbud om jobb eller tiltak i regi av Nav.',
      }).should('not.exist');

      cy.findByRole('link', { name: 'Grunnskole' }).click();
      cy.withinComponent('Har du tidligere fullført grunnskolen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg vil fortsette å søke jobb som kan kombineres med utdanningen min.',
      }).should('not.exist');
      cy.findByRole('checkbox', {
        name: 'Jeg vil takke ja hvis jeg får tilbud om jobb eller tiltak i regi av Nav som kan kombineres med utdanningen min.',
      }).should('not.exist');
      cy.findByRole('checkbox', {
        name: /Jeg vil fortsette å søke jobb mens jeg tar utdanning eller opplæring/,
      }).should('exist');
      cy.findByRole('checkbox', {
        name: 'Jeg vil takke ja hvis jeg får tilbud om jobb eller tiltak i regi av Nav.',
      }).should('exist');
    });
  });

  describe('Vedlegg cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605/utdanningEllerOpplaering${submission}`);
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('shows only the attachment that matches the selected education type', () => {
      educationPanels.forEach(({ option, panelTitle, attachmentLabel }) => {
        cy.findByRole('link', { name: 'Utdanning eller opplæring' }).click();
        selectEducation(option);

        cy.findByRole('link', { name: 'Vedlegg' }).click();

        educationPanels.forEach(({ attachmentLabel: otherAttachmentLabel }) => {
          if (otherAttachmentLabel === null) {
            return;
          }

          cy.findAllByRole('group', { name: otherAttachmentLabel }).should(
            otherAttachmentLabel === attachmentLabel ? 'have.length.at.least' : 'have.length',
            otherAttachmentLabel === attachmentLabel ? 1 : 0,
          );
        });

        cy.findByRole('heading', { level: 1, name: panelTitle }).should('not.exist');
      });

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav040605${submission}`);
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      // Veiledning
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg har lest veiledningen og vil svare så riktig som jeg kan.',
      }).click();
      cy.clickNextStep();

      // Dine opplysninger – use fnr path to keep address fields hidden
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Utdanning eller opplæring
      selectEducation('Grunnskole');
      cy.clickNextStep();

      // Grunnskole – choose previously completed path so the default declaration checkboxes are shown later
      cy.findByRole('textbox', { name: 'Navn på skole' }).type('Testskolen');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type(formatDate(startDate));
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type(formatDate(endDate));
      cy.findByRole('textbox', {
        name: 'Hvilke(t) trinn eller modul skal du gjennomføre?',
      }).type('Trinn 1-3');
      cy.withinComponent('Har du tidligere fullført grunnskolen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Erklæring – default checkbox pair for completed grunnskole path
      cy.findByRole('checkbox', {
        name: /Jeg vil fortsette å søke jobb mens jeg tar utdanning eller opplæring/,
      }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg vil takke ja hvis jeg får tilbud om jobb eller tiltak i regi av Nav.',
      }).click();
      cy.clickNextStep();

      // Avsluttende spørsmål
      cy.withinComponent(
        'Hva vil du gjøre hvis utdanningen eller opplæringen ikke kan kombineres med dagpenger?',
        () => {
          cy.findByRole('radio', {
            name: 'Jeg vil ikke ta utdanning eller opplæring, slik at jeg kan beholde dagpengene.',
          }).click();
        },
      );
      cy.clickNextStep();

      // Tilleggsopplysninger – optional
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg – isAttachmentPanel=true
      cy.findByRole('group', { name: /Dokumentasjon på at du tar grunnskoleopplæring/ }).within(() => {
        cy.findByRole('radio', { name: /Jeg ettersender dokumentasjonen senere/ }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utdanning eller opplæring', () => {
        cy.get('dt').eq(0).should('contain.text', 'Velg utdanning eller opplæring');
        cy.get('dd').eq(0).should('contain.text', 'Grunnskole');
      });
      cy.withinSummaryGroup('Grunnskole', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på skole');
        cy.get('dd').eq(0).should('contain.text', 'Testskolen');
      });
    });
  });
});
