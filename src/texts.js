export default {
  yes: "Ja",
  no: "Nei",
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
    firstTitle: (index) => `${index}. Last ned og skriv ut søknadspapirene til saken din`,
    firstDescription:
      "Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentasjonen. Den\n" +
      "        inneholder også adressen du skal sende dokumentene til.",
    downloadCoverPage: "Last ned førsteside",
    downloadApplication: "Last ned Søknad",
    attachmentSectionTitle: (index, skalSendeFlereVedlegg) =>
      `${index}. Legg ved ${skalSendeFlereVedlegg ? "disse vedleggene" : "dette vedlegget"}.`,
    sendInPapirSectionTitle: (index) => `${index}. Send søknaden i posten.`,
    SendInPapirSectionInstruction: "Følg instruksjonene på førstesidearket for å sende søknaden i posten.",
    sendInPapirAttachment: (vedleggSomSkalSendes) =>
      ` Husk å legge ved ${vedleggSomSkalSendes.length > 1 ? "vedleggene" : "vedlegget"} som nevnt i punkt 2 over.`,
    lastSectionTitle: (index) => `${index}. Hva skjer videre?`,
    lastSectionContent: "Du hører fra oss så fort vi har sett på saken din. Vi tar kontakt med deg om vi mangler noe.",
    goBack: "Gå tilbake",
  },
};
