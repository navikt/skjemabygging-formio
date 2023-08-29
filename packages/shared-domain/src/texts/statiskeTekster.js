export const statiske = {
  loading: "Laster...",
  introPage: {
    title: "Vær oppmerksom på dette før du begynner å fylle ut skjemaet",
    paperDescriptionBold: "Du må fylle ut skjemaet digitalt, og så sende det i posten.",
    paperDescription:
      "Etter utfylling må du laste ned det ferdig utfylte skjemaet som en PDF-fil, skrive det ut, signere og sende det i posten.",
    paperAndDigitalDescriptionBold: "Du må fylle ut skjemaet digitalt.",
    paperAndDigitalDescription:
      "Etter utfylling kan du velge mellom digital innsending (krever innlogging) eller sende det i posten. I begge tilfeller må du laste ned det ferdig utfylte skjemaet som en pdf-fil, som du så enten kan laste opp eller skrive ut og sende i posten.",
    noSubmissionDescriptionBold: "Du må fylle ut skjemaet digitalt.",
    noSubmissionDescription: "Etter utfylling må du laste ned det ferdig utfylte skjemaet som en pdf-fil.",
    requiredFieldsBold: "De fleste feltene i skjemaet er obligatoriske å fylle ut.",
    requiredFields: "Felt som ikke er obligatoriske er merket med: (valgfritt).",
    notSaveBold: "Du kan ikke lagre skjemaet underveis.",
    notSave:
      "Informasjonen du fyller ut i skjemaet sendes ikke til NAV før du har fullført hele skjemaet og sendt det inn. Hvis du lukker vinduet eller nettleseren vil all informasjon du har fylt ut forsvinne.",
    publicComputerBold: "Bruk av offentlig PC:",
    publicComputer:
      "Hvis du fyller ut skjemaet på en offentlig PC, for eksempel på et bibliotek, er det viktig at du lukker nettleseren når du er ferdig. Dette vil forhindre at uvedkommende får tak i opplysningene du har fylt ut i skjemaet.",
    submissionMethod: {
      legend: "Hvordan vil du sende inn skjemaet?",
      paper: "Send i posten",
      digital: "Send digitalt (krever innlogging)",
    },
  },
  mellomlagringError: {
    get: {
      title: "Beklager, vi kunne ikke hente den lagrede søknaden akkurat nå.",
      message: "Prøv igjen senere, eller fyll ut en ny søknad.",
      notFoundMessage: "Vi kunne ikke finne denne søknaden.",
    },
    update: {
      title: "Beklager, vi har midlertidige tekniske problemer.",
      message:
        "Vi klarte ikke å lagre søknaden. Vennligst prøv igjen senere. Vær oppmerksom på at du kan miste endringene dine hvis du forlater nettstedet.",
    },
    delete: {
      title: "Beklager, vi har midlertidige tekniske problemer.",
      message: "Vi klarte ikke å slette den lagrede søknaden. Vennligst prøv igjen senere.",
    },
    submit: {
      title: "Beklager, vi har midlertidige tekniske problemer.",
      savedDraftMessage: "Skjemaet er lagret som et utkast på Min Side - Utkast.",
      tryLaterMessage: "Vennligst prøv igjen senere.",
    },
  },
  summaryPage: {
    title: "Oppsummering",
    description:
      "Vennligst sjekk at alle opplysningene dine er riktige. Hvis alle opplysningene er riktige går du videre til neste steg.",
    confirmationError: "Du må samtykke før du kan fortsette",
    validationMessage: {
      start:
        "Nedenfor finner du all informasjonen du allerede har fylt inn i skjemaet, fordelt på de forskjellige stegene i skjemaet. Alle steg som mangler informasjon er markert med ",
      end: ". Klikk på Fortsett utfylling for å gå til det første feltet i skjemaet som mangler informasjon. Klikk på Rediger...-lenken under hver stegoverskrift for å fortsette utfylling på det steget.",
    },
  },
  warningAboutDifficultSubmission: {
    modal: {
      title: "Dette er en tjeneste under utvikling",
      text1: "Hvis du velger digital innsending må du laste ned skjemaet og laste det opp igjen i neste steg.",
      text2: "Digital innsending er vanskelig på iPad og iPhone.",
    },
    alert:
      "Hvis du velger digital innsending må du laste ned skjemaet i neste steg og laste det opp igjen etter innlogging.",
  },
  prepareLetterPage: {
    subTitle: "Innsending/Send til NAV",
    chooseEntity: "Velg hvilken NAV-enhet som skal motta innsendingen",
    selectEntityDefault: "Velg enhet",
    entityNotSelectedError: "Førsteside kan ikke genereres før du har valgt enhet",
    entityFetchError: "En feil har oppstått. Vi kunne ikke laste enheter. Beklager ulempen, prøv igjen senere.",
    firstSectionTitle: "Last ned og skriv ut dokumentene",
    firstDescription:
      "Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentene, og hvilken adresse de skal sendes til.",
    attachmentSectionTitleAttachTo: "Legg ved",
    attachmentSectionTitleTheseAttachments: "disse vedleggene",
    attachmentSectionTitleThisAttachment: "dette vedlegget",
    sendInPapirSectionTitle: "Send det hele til NAV i posten",
    SendInPapirSectionInstruction: "Følg instruksjonene på førstesidearket for å sende dokumentene i posten.",
    sendInPapirSectionAttachTo: "Husk å legge ved",
    sendInPapirSectionAttachments: "vedleggene",
    sendInPapirSectionAttachment: "vedlegget",
    sendInPapirSection: "som nevnt i punkt 2 over.",
  },
  declaration: {
    header: "Erklæring",
    defaultText: "Jeg bekrefter at opplysningene er riktige.",
  },
};
