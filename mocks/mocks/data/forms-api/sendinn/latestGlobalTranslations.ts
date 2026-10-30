import globalTranslations from '../global-translations.json';

const sendinnTranslations = [
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
