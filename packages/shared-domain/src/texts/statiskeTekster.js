export const statiske = {
  loading: 'Laster...',
  external: {
    minSide: {
      linkText: 'Min side',
      url: 'https://www.nav.no/minside',
    },
  },
  footer: {
    userIdLabel: 'F.nr',
    createdDatelabel: 'Opprettet',
    schemaNumberLabel: 'Skjemanummer',
    versionLabel: 'Versjon',
    pageLabel: 'Side',
    ofLabel: 'av',
  },
  introPage: {
    title: 'Vær oppmerksom på dette før du begynner å fylle ut skjemaet',
    paperDescriptionBold: 'Du må fylle ut skjemaet digitalt, og så sende det i posten.',
    paperDescription:
      'Etter utfylling må du laste ned det ferdig utfylte skjemaet som en PDF-fil, skrive det ut, signere og sende det i posten.',
    paperAndDigitalDescriptionBold: 'Du må fylle ut skjemaet digitalt.',
    paperAndDigitalDescription:
      'Etter utfylling kan du velge mellom digital innsending (krever innlogging) eller sende det i posten. I begge tilfeller må du laste ned det ferdig utfylte skjemaet som en pdf-fil, som du så enten kan laste opp eller skrive ut og sende i posten.',
    noSubmissionDescriptionBold: 'Du må fylle ut skjemaet digitalt.',
    noSubmissionDescription: 'Etter utfylling må du laste ned det ferdig utfylte skjemaet som en pdf-fil.',
    requiredFieldsBold: 'De fleste feltene i skjemaet er obligatoriske å fylle ut.',
    requiredFields: 'Felt som ikke er obligatoriske er merket med: (valgfritt).',
    autoSaveBold: 'Vi lagrer et utkast av skjemaet automatisk hver gang du går til neste steg.',
    autoSave:
      'Du finner utkastet på Min side. Nav kan ikke se informasjonen i utkastet. Du må trykke på “Send til Nav” for at Nav skal motta skjemaet/søknaden.',
    notSaveBold: 'Du kan ikke lagre skjemaet underveis.',
    notSave:
      'Informasjonen du fyller ut i skjemaet sendes ikke til Nav før du har fullført hele skjemaet og sendt det inn. Hvis du lukker vinduet eller nettleseren vil all informasjon du har fylt ut forsvinne.',
    publicComputerBold: 'Bruk av offentlig PC:',
    publicComputer:
      'Hvis du fyller ut skjemaet på en offentlig PC, for eksempel på et bibliotek, er det viktig at du lukker nettleseren når du er ferdig. Dette vil forhindre at uvedkommende får tak i opplysningene du har fylt ut i skjemaet.',
    submissionMethod: {
      legend: 'Hvordan vil du sende inn skjemaet?',
      paper: 'Send i posten',
      digital: 'Send digitalt (krever innlogging)',
    },
  },
  paabegynt: {
    activeTasksHeading: 'Du har {{amount}} påbegynte utkast til denne søknaden',
    oneActiveTaskHeading: 'Du har ett påbegynt utkast til denne søknaden',
    activeTasksBody: 'Vil du fortsette eller starte på en ny?',
    continueTask: 'Fortsett på utkast',
    startNewTask: 'Start på ny',
    sendAttachmentsHeading: 'Du har en eller flere innsendte søknader som mangler vedlegg',
    sendAttachmentsBody: 'Vil du ettersende vedlegg?',
    sendAttachment: 'Ettersend vedlegg',
  },
  mellomlagringError: {
    get: {
      title: 'Beklager, vi kunne ikke hente den lagrede søknaden akkurat nå.',
      message: 'Prøv igjen senere, eller fyll ut en ny søknad.',
    },
    create: {
      title: 'Beklager, vi har midlertidige tekniske problemer.',
      message:
        'Vi klarer ikke å lagre søknaden. Vær oppmerksom på at du kan miste endringene dine hvis du forlater nettstedet.',
    },
    update: {
      title: 'Beklager, vi har midlertidige tekniske problemer.',
      message:
        'Vi klarte ikke å lagre søknaden. Vennligst prøv igjen senere. Vær oppmerksom på at du kan miste endringene dine hvis du forlater nettstedet.',
    },
    updateNotFound: {
      title: 'Beklager, det har skjedd en feil',
      messageStart: 'Vi kunne ikke lagre søknaden fordi den allerede er sendt inn eller slettet. Gå til ',
      messageEnd: ' for å se dine påbegynte og innsendte søknader.',
    },
    delete: {
      title: 'Beklager, vi har midlertidige tekniske problemer.',
      message: 'Vi klarte ikke å slette den lagrede søknaden. Vennligst prøv igjen senere.',
    },
    deleteNotFound: {
      title: 'Beklager, det har skjedd en feil',
      messageStart: 'Vi kunne ikke slette søknaden fordi den allerede er slettet eller sendt inn. Gå til ',
      messageEnd: ' for å se dine påbegynte og innsendte søknader.',
    },
    submit: {
      title: 'Beklager, vi har midlertidige tekniske problemer.',
      draftSaved: 'Skjemaet ble sist lagret {{date}}. Du finner utkastet på Min Side. Vennligst prøv igjen senere.',
      draftNotSaved:
        'Vennligst prøv igjen senere. Vær oppmerksom på at du kan miste endringene dine hvis du forlater nettstedet.',
    },
    submitNotFound: {
      title: 'Beklager, det har skjedd en feil',
      messageStart: 'Vi kunne ikke sende inn søknaden fordi den allerede er sendt inn eller slettet. Gå til ',
      messageEnd: ' for å se dine påbegynte og innsendte søknader.',
    },
  },
  summaryPage: {
    title: 'Oppsummering',
    description:
      'Vennligst sjekk at alle opplysningene dine er riktige. Hvis alle opplysningene er riktige går du videre til neste steg.',
    confirmationError: 'Du må samtykke før du kan fortsette',
    validationIcon: 'Opplysninger mangler',
    validationMessage:
      'Nedenfor finner du all informasjonen du allerede har fylt inn i skjemaet, fordelt på de forskjellige stegene i skjemaet. Alle steg som mangler informasjon er markert med',
  },
  warningAboutDifficultSubmission: {
    modal: {
      title: 'Dette er en tjeneste under utvikling',
      text1: 'Hvis du velger digital innsending må du laste ned skjemaet og laste det opp igjen i neste steg.',
      text2: 'Digital innsending er vanskelig på iPad og iPhone.',
    },
    alert:
      'Hvis du velger digital innsending må du laste ned skjemaet i neste steg og laste det opp igjen etter innlogging.',
  },
  prepareLetterPage: {
    subTitle: 'Skjemaet er ikke sendt ennå',
    chooseEntity: 'Velg hvilken Nav-enhet som skal motta innsendingen',
    selectEntityDefault: 'Velg enhet',
    entityNotSelectedError: 'Søknaden kan ikke lastes ned før du har valgt enhet',
    entityFetchError: 'En feil har oppstått. Vi kunne ikke laste enheter. Beklager ulempen, prøv igjen senere.',
    firstDescription: 'Gjør følgende for å sende det til Nav:',
    printFormTitle: 'Skriv ut og signér skjemaet',
    printFormDescription: 'Du må signere til slutt i skjemaet.',
    attachmentSectionTitleAttachTo: 'Legg ved',
    attachmentSectionTitleTheseAttachments: 'disse vedleggene',
    attachmentSectionTitleThisAttachment: 'dette vedlegget',
    sendInPapirSectionTitle: 'Send utskrift til Nav i posten',
    sendInPapirSectionTitleWithAttachment: 'Send utskrift og vedlegg til Nav i posten',
    SendInPapirSectionInstruction:
      'Første side i skjema må legges øverst i innsendingen. Den inneholder informasjon om hvilken adresse du skal sende dokumentene til. ',
    downloadSuccess:
      'Nedlastingen er ferdig. Filen ligger i mappen for nedlastinger på enheten din og heter: {{fileName}}',
    downloadError: 'Det skjedde en feil ved nedlasting av søknaden. Vennligst prøv igjen.',
  },
  declaration: {
    header: 'Erklæring',
    defaultText: 'Jeg bekrefter at opplysningene er riktige.',
    standardCheckboxLabel: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
    standardCheckboxDescription:
      '<p>Det er viktig at du gir oss riktige opplysninger slik at vi kan behandle saken din. <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no/endringer">Les mer om viktigheten av å gi riktige opplysninger (åpnes i ny fane)</a>.</p>',
  },
  attachment: {
    leggerVedNaa: 'Jeg legger det ved dette skjemaet',
    ettersender: 'Jeg ettersender dokumentasjonen senere',
    nei: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
    levertTidligere: 'Jeg har levert denne dokumentasjonen tidligere',
    harIkke: 'Jeg har ikke denne dokumentasjonen',
    andre: 'Sendes inn av andre (for eksempel lege, arbeidsgiver)',
    nav: 'Jeg ønsker at Nav innhenter denne dokumentasjonen',
    deadline:
      'Hvis vi ikke har mottatt dette vedlegget innen {{deadline}} dager blir saken behandlet med de opplysningene som foreligger.',
  },
  activities: {
    label: 'Hvilken aktivitet søker du om støtte i forbindelse med?',
    defaultActivity: 'Ingen relevant aktivitet registrert på meg',
    error: 'Det oppstod en feil ved henting av aktiviteter.',
    errorContinue: 'Det oppstod en feil ved henting av aktiviteter. Du kan fortsatt gå videre uten å velge aktivitet',
    yourActivities: 'Dine aktiviteter',
    registeredActivities: 'Vi har registrert at du deltar på følgende aktivitet(er):',
  },
  drivingList: {
    activity: 'Aktivitet',
    period: 'Periode: {{period}}',
    dailyRate: 'Dagsats for parkeringsavgift: {{rate}} kr',
    expensesTooHighHeader: 'Utgiftene er høyere enn beløpet du kan få refundert',
    expensesTooHigh:
      'I vedtaket ditt om stønad til daglig reise beregnet vi hvor mye du vil få utbetalt i hver periode. Du har nå lagt inn høyere utgifter til bruk av egen bil enn det vi har beregnet. Du vil sannsynligvis ikke få refundert alle utgiftene du har lagt inn for denne perioden.',
    periodInfoHeader: 'Tilgjengelige perioder',
    periodInfoSubheader: 'Nedenfor har vi listet opp hvilke perioder du kan levere kjøreliste for.',
    periodInfoYouCan: 'Du kan:',
    periodInfoElement1: 'levere kjøreliste for flere perioder av gangen',
    periodInfoElement2: 'gå tilbake og levere kjøreliste for andre periode senere',
    periodInfoElement3: 'ikke gå tilbake og endre kjørelister for perioder du allerede har sendt inn',
    periodInfoElement4: 'ikke levere kjøreliste for perioder frem i tid',
    noVedtakHeading: 'Vi har ikke registert at du har vedtak om stønad til daglig reise med bruk av egen bil',
    noVedtak:
      'Du må søke om tilleggsstønad og motta vedtak før du kan sende inn liste over utgifter til daglig reise med bruk av egen bil. Ta kontakt med Nav på telefon 55 55 33 33 hvis du mener du allerede har vedtak.',
    previousDrivingList: 'Perioder du tidligere har fått refundert reiseutgifter for',
    addPeriod: 'Legg til periode',
    removePeriod: 'Fjern periode',
    parking: 'Skal du registrere parkering?',
    datePicker: 'Velg første dato i perioden du ønsker å levere kjøreliste for (dd.mm.åååå)',
    datePickerDescription:
      'Du vil få mulighet til å sende kjøreliste fra denne datoen frem til dagens dato. Det er ikke mulig å legge til kjørelister for fremtidige datoer.',
    dateSelect: 'Kryss av for de dagene du har brukt egen bil',
    dateSelectParking: 'og har hatt parkeringsutgifter',
    parkingExpenses: 'Parkeringsutgifter (kr)',
    noPeriods:
      'Du har ingen tilgjengelige perioder å levere kjøreliste for. Husk at det ikke er mulig å levere kjørelister for perioder frem i tid. Neste periode slutter {{date}}',
    parkingInfo:
      'Hvis du har parkeringsutgifter over 100 kroner per dag må du <a href="/fyllut/nav111224b?sub=paper">sende inn kjørelisten på papir</a>. Husk å legge ved kvitteringer som dokumenterer utgiften.',
    accordionHeader: 'Legg til kjøreliste for én eller flere perioder',
    summaryDescription: 'Du har oppgitt at du har reist med egen bil på disse dagene:',
    summaryTextParking: '{{date}}, parkeringsutgift: {{parking}} kr',
  },
  address: {
    livesInNorway: 'Bor du i Norge?',
    yourContactAddress: 'Er kontaktadressen en vegadresse eller postboksadresse?',
    skatteetatenLink: 'Endre folkeregistrert adresse på Skatteetatens nettsider (åpnes i ny fane)',
    streetAddress: 'Vegadresse',
    streetAddressLong: 'Vegnavn og husnummer, eller postboks',
    postalCode: 'Postnummer',
    postalName: 'Poststed',
    location: 'By / stedsnavn',
    country: 'Land',
    co: {
      label: 'C/O',
      readMore: {
        header: 'Hva er C/O?',
        content:
          'C/O brukes hvis ditt navn ikke står på den postkassen som posten er adressert til. Du oppgir da navnet på "eieren" av postkassen, som kan være navnet på en person eller et firma.',
      },
    },
    poBox: 'Postboks',
    poAddress: 'Postboksadresse',
    building: 'Bygning',
    region: 'Region',
    validFrom: 'Gyldig fra (dd.mm.åååå)',
    validFromDescription:
      'Fra hvilken dato skal denne adressen brukes? Du kan sette denne datoen maks 1 år tilbake i tid.',
    validTo: 'Gyldig til (dd.mm.åååå)',
    validToDescription:
      'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
  },
  identity: {
    doYouHaveIdentityNumber: 'Har du norsk fødselsnummer eller d-nummer?',
    identityNumber: 'Fødselsnummer eller d-nummer',
    yourBirthdate: 'Fødselsdato (dd.mm.åååå)',
  },
  dataFetcher: {
    other: 'Annet',
  },
  error: {
    notFoundTitle: 'Beklager, fant ikke siden',
    serverErrorTitle: 'Beklager, det oppsto en feil',
    notFoundMessage: 'Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.',
    serverErrorMessage:
      'En teknisk feil på våre servere gjør at siden er utilgjengelig. Dette skyldes ikke noe du gjorde.',
    goToFrontPage: 'Gå til forsiden',
    contactUs:
      'Hvis problemet vedvarer, <a href="https://nav.no/kontaktoss" target="_blank" rel="noopener noreferrer">kan du kontakte oss (åpnes i ny fane)</a>',
    reportError: 'Meld gjerne fra om at lenken ikke virker',
    errorId: 'Feil-kode',
    statusCode: 'Statuskode',
    suggestions: 'Du kan prøve å',
    wait: 'vente noen minutter og',
    reloadPage: 'laste siden på nytt',
    goBack: 'gå tilbake til forrige side',
  },
};
