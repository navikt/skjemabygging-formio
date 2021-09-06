//Denne filen erstattes av filene statiskeTekster.js, validering.js og grensesnitt.js (i src/texts/) når globale oversettelser er klar.
// Linje 4 og 5 ("yes" og "no") håndteres av skjematekster i globale oversettelser.
const texts = {
  yes: "Ja",
  no: "Nei",
  downloadApplication: "Last ned Søknad",
  goBack: "Gå tilbake",
  summaryPage: {
    title: "Oppsummering av søknaden din",
    description:
      "Vennligst sjekk at alle svarene dine er riktige. Hvis du finner noe som må korrigeres " +
      'trykker du på "Rediger"-knappen nedenfor. Hvis alle svarene er riktige går du videre til steg 2.',
    editAnswers: "Rediger svar",
    continue: "Gå videre",
    continueToPostalSubmission: "Send i posten",
    continueToDigitalSubmission: "Send inn digitalt",
  },
  prepareLetterPage: {
    firstSectionTitle: "Last ned og skriv ut søknadspapirene til saken din",
    firstDescription:
      "Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentasjonen. Den\n" +
      "        inneholder også adressen du skal sende dokumentene til.",
    downloadCoverPage: "Last ned førsteside",
    attachmentSectionTitleAttachTo: "Legg ved",
    attachmentSectionTitleTheseAttachments: "disse vedleggene",
    attachmentSectionTitleThisAttachment: "dette vedlegget",
    sendInPapirSectionTitle: "Send søknaden i posten",
    SendInPapirSectionInstruction: "Følg instruksjonene på førstesidearket for å sende søknaden i posten.",
    sendInPapirSectionAttachTo: "Husk å legge ved",
    sendInPapirSectionAttachments: "vedleggene",
    sendInPapirSectionAttachment: "vedlegget",
    sendInPapirSection: "som nevnt i punkt 2 over.",
    lastSectionTitle: "Hva skjer videre?",
    lastSectionContent: "Du hører fra oss så fort vi har sett på saken din. Vi tar kontakt med deg om vi mangler noe.",
  },
  prepareSubmitPage: {
    firstSectionTitle: "1. Last ned søknaden (PDF). Du blir bedt om å laste den opp på neste side.",
    firstSectionDescription:
      'Når du klikker på "Last ned søknad" åpnes søknaden din i en ny fane i nettleseren. Du må lagre pdf-filen på maskinen din på en plass hvor du kan finne den igjen.',
    firstSectionInstruction:
      "Du trenger pdf-filen i neste steg. Kom deretter tilbake hit for å gå videre til innsending av søknaden.",
    secondSectionTitle: "2. Instruksjoner for innsending av søknaden",
    secondSectionInstruction:
      'Når du klikker på "Gå videre" nedenfor åpnes det en ny side med en opplastingstjeneste (krever innlogging) for å laste opp pdf-filen som du lagret på maskinen din i forrige steg.',
    confirmCheckboxLabel: "Jeg har lastet ned PDF-en og lest instruksjonene.",
    confirmCheckboxDescription: "Etter at du har logget inn:",
    confirmCheckboxInstructionOne: 'Trykk på "Fyll ut og last opp"',
    confirmCheckboxInstructionTwo: 'Trykk på "Finn filen". (OBS! IKKE trykk på "Åpne skjema"-knappen)',
    confirmCheckboxInstructionThree: "Finn og velg søknadsfilen som du lastet ned og lagret på maskinen din",
    confirmCheckboxInstructionFour:
      "Følg instruksjonene videre for å laste opp eventuelle vedlegg og fullføre innsendingen",
    confirmCheckboxWarning: "Du må bekrefte at du har lest instruksjonene over før du kan gå videre.",
    moveForward: "Gå videre",
  },
};
export default texts;
