import globalTranslations from '../global-translations.json';

const sendinnTranslations = [
  {
    key: 'Du må velge minst ett vedlegg',
    nb: 'Du må velge minst ett vedlegg',
    nn: 'Du må velje minst eitt vedlegg',
    en: 'Choose at least one attachment',
  },
  {
    key: 'Ettersending til {{formNumber}} {{title}}',
    nb: 'Ettersending til {{formNumber}} {{title}}',
    nn: 'Ettersending til {{formNumber}} {{title}}',
    en: 'Additional documentation for {{formNumber}} {{title}}',
  },
  {
    key: 'Dokumentene er ikke sendt ennå',
    nb: 'Dokumentene er ikke sendt ennå',
    nn: 'Dokumenta er ikkje sende enno',
    en: 'The documents have not been sent yet',
  },
  { key: 'Last ned førsteside', nb: 'Last ned førsteside', nn: 'Last ned førsteside', en: 'Download cover page' },
  { key: 'Skriv ut førstesiden', nb: 'Skriv ut førstesiden', nn: 'Skriv ut førstesida', en: 'Print the cover page' },
  {
    key: 'Lager førstesiden. Vent litt.',
    nb: 'Lager førstesiden. Vent litt.',
    nn: 'Lagar førstesida. Vent litt.',
    en: 'Preparing the cover page. Please wait.',
  },
  {
    key: 'Vi kunne ikke laste ned førstesiden. Prøv igjen.',
    nb: 'Vi kunne ikke laste ned førstesiden. Prøv igjen.',
    nn: 'Vi kunne ikkje laste ned førstesida. Prøv igjen.',
    en: 'We could not download the cover page. Try again.',
  },
  {
    key: 'Instruksjoner for innsending',
    nb: 'Instruksjoner for innsending',
    nn: 'Instruksjonar for innsending',
    en: 'Submission instructions',
  },
  {
    key: 'Legg førstesiden med strekkode på toppen av dokumentene.',
    nb: 'Legg førstesiden med strekkode på toppen av dokumentene.',
    nn: 'Legg førstesida med strekkode på toppen av dokumenta.',
    en: 'Place the cover page with the barcode on top of the documents.',
  },
  {
    key: 'Legg ved alle vedlegg som er listet på førstesiden.',
    nb: 'Legg ved alle vedlegg som er listet på førstesiden.',
    nn: 'Legg ved alle vedlegg som er lista på førstesida.',
    en: 'Enclose all attachments listed on the cover page.',
  },
  {
    key: 'Legg dokumentene i en konvolutt som du sender i posten til adressen som står på førstesiden.',
    nb: 'Legg dokumentene i en konvolutt som du sender i posten til adressen som står på førstesiden.',
    nn: 'Legg dokumenta i ein konvolutt som du sender i posten til adressa som står på førstesida.',
    en: 'Put the documents in an envelope and post it to the address on the cover page.',
  },
  {
    key: 'Hvem gjelder innsendingen for?',
    nb: 'Hvem gjelder innsendingen for?',
    nn: 'Kven gjeld innsendinga for?',
    en: 'Who is the submission for?',
  },
  {
    key: 'Person som har fødselsnummer eller d-nummer',
    nb: 'Person som har fødselsnummer eller d-nummer',
    nn: 'Person som har fødselsnummer eller d-nummer',
    en: 'Person with a national identity number',
  },
  {
    key: 'Person som ikke har fødselsnummer eller d-nummer',
    nb: 'Person som ikke har fødselsnummer eller d-nummer',
    nn: 'Person som ikkje har fødselsnummer eller d-nummer',
    en: 'Person without a national identity number',
  },
  {
    key: 'Flere personer / Nav-enhet',
    nb: 'Flere personer / Nav-enhet',
    nn: 'Fleire personar / Nav-eining',
    en: 'Multiple people / Nav unit',
  },
  {
    key: 'Har du vært i kontakt med Nav om saken?',
    nb: 'Har du vært i kontakt med Nav om saken?',
    nn: 'Har du vore i kontakt med Nav om saka?',
    en: 'Have you contacted Nav about the case?',
  },
  {
    key: 'Kontroller opplysningene',
    nb: 'Kontroller opplysningene',
    nn: 'Kontroller opplysningane',
    en: 'Check your answers',
  },
  { key: 'Prøv igjen', nb: 'Prøv igjen', nn: 'Prøv igjen', en: 'Try again' },
  {
    key: 'Send dokumenter til Nav',
    nb: 'Send dokumenter til Nav',
    nn: 'Send dokument til Nav',
    en: 'Send documents to Nav',
  },
  {
    key: 'Send inn dokumentasjon til skjema',
    nb: 'Send inn dokumentasjon til skjema',
    nn: 'Send inn dokumentasjon til skjema',
    en: 'Submit documentation for a form',
  },
  {
    key: 'Send inn etterspurt dokumentasjon til skjema',
    nb: 'Send inn etterspurt dokumentasjon til skjema',
    nn: 'Send inn etterspurd dokumentasjon til skjema',
    en: 'Submit requested documentation for a form',
  },
  {
    key: 'Send inn etterspurt dokumentasjon',
    nb: 'Send inn etterspurt dokumentasjon',
    nn: 'Send inn etterspurd dokumentasjon',
    en: 'Submit requested documentation',
  },
  {
    key: 'Send inn etterspurt dokumentasjon fra varsel',
    nb: 'Send inn etterspurt dokumentasjon fra varsel',
    nn: 'Send inn etterspurd dokumentasjon frå varsel',
    en: 'Submit requested documentation from a notification',
  },
  {
    key: 'Beklager, fant ikke siden',
    nb: 'Beklager, fant ikke siden',
    nn: 'Beklagar, fann ikkje sida',
    en: 'Sorry, we could not find the page',
  },
  {
    key: 'Gå til forsiden',
    nb: 'Gå til forsiden',
    nn: 'Gå til framsida',
    en: 'Go to the front page',
  },
];

const sendinnKeys = new Set(sendinnTranslations.map(({ key }) => key));
const latestSendinnGlobalTranslations = [
  ...globalTranslations.filter(({ key }) => !sendinnKeys.has(key)),
  ...sendinnTranslations,
];

export { latestSendinnGlobalTranslations };
