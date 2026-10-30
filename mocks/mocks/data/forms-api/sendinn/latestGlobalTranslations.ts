import globalTranslations from '../global-translations.json';

const sendinnTranslations = [
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
