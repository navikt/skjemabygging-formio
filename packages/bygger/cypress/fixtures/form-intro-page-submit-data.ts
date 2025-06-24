export const submitData = {
  title: 'Cypress test for settings page',
  skjemanummer: 'cypress-settings',
  tema: 'BIL',
  downloadPdfButtonText: 'DownloadPDFBtnTest',
  submissionTypes: ['PAPER', 'DIGITAL'],
  subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
  descriptionOfSignatures: 'Test Instructions',
  signatureLabel: 'Test account',
  signatureDescription: 'Instruction from test...',
  isLockedForm: false,
  mellomlagringDurationDays: '10',
  introPage: {
    enabled: true,
    introduction: 'Velkomstmelding',
    importantInformation: {
      title: 'Viktig informasjon',
      description: 'Dette er viktig informasjon som brukeren må lese før de fortsetter.',
    },
    sections: {
      prerequisites: {
        title: 'introPage.prerequisites.title.alt1',
        description: 'Dette er hva du må ha klart før du starter',
        bulletPoints: ['Et kulepunkt for informasjon om utfylling av skjemaet'],
      },
      dataTreatment: {
        description: 'Dette er hvordan vi behandler dine data',
        bulletPoints: [
          'Et kulepunkt for hvordan vi behandler personopplysninger',
          'Enda et kulepunkt for hvordan vi behandler personopplysninger',
        ],
      },
      scope: {
        title: 'introPage.scope.title.alt1',
        description: 'Dette er hva skjemaet kan brukes til',
        bulletPoints: [
          'Kulepunkt for hva skjemaet kan brukes til...',
          'Enda et kulepunkt for hva skjemaet kan brukes til...',
        ],
      },
      outOfScope: {
        title: 'introPage.outOfScope.title.alt3',
        description: 'Dette er hva skjemaet ikke skal brukes til',
        bulletPoints: ['Kulepunkt for ikke bruk til...', 'Enda et kulepunkt for ikke bruk til...'],
      },
      dataDisclosure: {
        title: 'introPage.dataDisclosure.title.alt2',
        bulletPoints: ['Kulepunkt for informasjon vi henter om deg'],
      },
      automaticProcessing: {
        description: 'Dette er informasjon om automatisk saksbehandling',
        bulletPoints: ['Kulepunkt for automatisk saksbehandling', 'Enda et kulepunkt for automatisk saksbehandling'],
      },
      optional: {
        title: 'Valgfri seksjon',
        description: 'Dette er en valgfri seksjon',
        bulletPoints: ['Kulepunkt for valgfritt element', 'Enda et kulepunkt for valgfritt element'],
      },
    },
    selfDeclaration: 'introPage.selfDeclaration.description.alt3',
  },
};
