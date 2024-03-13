export const statiske = {
  loading: 'Laster...',
  external: {
    minSide: {
      linkText: 'Min side',
      url: 'https://www.nav.no/minside',
    },
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
      'Du finner utkastet på Min side. NAV kan ikke se informasjonen i utkastet. Du må trykke på “Send til NAV” for at NAV skal motta skjemaet/søknaden.',
    notSaveBold: 'Du kan ikke lagre skjemaet underveis.',
    notSave:
      'Informasjonen du fyller ut i skjemaet sendes ikke til NAV før du har fullført hele skjemaet og sendt det inn. Hvis du lukker vinduet eller nettleseren vil all informasjon du har fylt ut forsvinne.',
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
    subTitle: 'Innsending/Send til NAV',
    chooseEntity: 'Velg hvilken NAV-enhet som skal motta innsendingen',
    selectEntityDefault: 'Velg enhet',
    entityNotSelectedError: 'Førsteside kan ikke genereres før du har valgt enhet',
    entityFetchError: 'En feil har oppstått. Vi kunne ikke laste enheter. Beklager ulempen, prøv igjen senere.',
    firstSectionTitle: 'Last ned og skriv ut dokumentene',
    firstDescription:
      'Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentene, og hvilken adresse de skal sendes til.',
    attachmentSectionTitleAttachTo: 'Legg ved',
    attachmentSectionTitleTheseAttachments: 'disse vedleggene',
    attachmentSectionTitleThisAttachment: 'dette vedlegget',
    sendInPapirSectionTitle: 'Send det hele til NAV i posten',
    SendInPapirSectionInstruction: 'Følg instruksjonene på førstesidearket for å sende dokumentene i posten.',
    sendInPapirSectionAttachTo: 'Husk å legge ved',
    sendInPapirSectionAttachments: 'vedleggene',
    sendInPapirSectionAttachment: 'vedlegget',
    sendInPapirSection: 'som nevnt i punkt 2 over.',
  },
  declaration: {
    header: 'Erklæring',
    defaultText: 'Jeg bekrefter at opplysningene er riktige.',
  },
  attachment: {
    leggerVedNaa: 'Jeg legger det ved dette skjemaet',
    ettersender: 'Jeg ettersender dokumentasjonen senere',
    nei: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
    levertTidligere: 'Jeg har levert denne dokumentasjonen tidligere',
    harIkke: 'Jeg har ikke denne dokumentasjonen',
    andre: 'Sendes inn av andre (for eksempel lege, arbeidsgiver)',
    nav: 'Jeg ønsker at NAV innhenter denne dokumentasjonen',
    deadline:
      'Hvis vi ikke har mottatt dette vedlegget innen {{deadline}} dager blir saken behandlet med de opplysningene som foreligger.',
  },
  activities: {
    label: 'Velg hvilken aktivitet du vil søke om stønad for',
    defaultActivity: 'Jeg får ikke opp noen aktiviteter her som stemmer med det jeg vil søke om',
    error: 'Det oppstod en feil ved henting av aktiviteter.',
    errorContinue: 'Det oppstod en feil ved henting av aktiviteter. Du kan fortsatt gå videre uten å velge aktivitet',
  },
  drivingList: {
    activity: 'Aktivitet',
    period: 'Periode for aktiviteten',
    dailyRate: 'Din dagsats uten parkeringsutgift',
    expensesTooHighHeader: 'Utgiftene er høyere enn beløpet du kan få refundert',
    expensesTooHigh:
      'I vedtaket ditt om stønad til daglig reise beregnet vi hvor mye du vil få utbetalt i hver periode. Du har nå lagt inn høyere utgifter til bruk av egen bil enn det vi har beregnet. Du vil sannsynligvis ikke få refundert alle utgiftene du har lagt inn for denne perioden.',
    error: 'Kunne ikke hente aktiviteter. Du kan sende inn søknad via papir',
    noVedtak:
      'Det er ikke registrert vedtak om tilleggsstønad på deg. Du må søke om tilleggsstønad og motta vedtak før du kan sende inn liste over utgifter til daglig reise med bruk av egen bil.',
    previousDrivingList: 'Perioder du tidligere har fått refundert reiseutgifter for',
    addPeriod: 'Legg til periode',
    removePeriod: 'Fjern periode',
    label: 'Legg til kjøreliste for en eller flere perioder',
    parking: 'Skal du registrere parkering?',
    periodType: 'Velg periode for innsending',
    datePicker: 'Velg første dato i perioden',
    datePickerDescription:
      'Den tidligste tilgjengelige datoen er en periode før dagens dato. Det er ikke mulig å legge til kjørelister for fremtidige datoer',
    dateSelect: 'Kryss av for de dagene du har brukt egen bil',
    dateSelectParking: 'og har hatt parkeringsutgifter',
    parkingExpenses: 'Parkeringsutgifter (kr)',
  },
};
