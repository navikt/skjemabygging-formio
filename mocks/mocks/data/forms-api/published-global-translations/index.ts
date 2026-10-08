// Published global translations keyed by bokmål text, as served by forms-api
// GET /v1/published-global-translations/{languageCode}. Holds only the texts sendinn uses.
const en: Record<string, string> = {
  'Velg språk': 'Select language',
  'Send dokumenter til Nav': 'Send documents to Nav',
  'Send inn dokumentasjon til skjema': 'Submit documentation for a form',
  'Send inn etterspurt dokumentasjon til skjema': 'Submit requested documentation for a form',
  'Send inn etterspurt dokumentasjon': 'Submit requested documentation',
  'Denne tjenesten er under utvikling.': 'This service is under development.',
  'Beklager, fant ikke siden': 'Sorry, we could not find the page',
  'Gå til forsiden': 'Go to the front page',
};

const nn: Record<string, string> = {
  'Velg språk': 'Vel språk',
  'Send dokumenter til Nav': 'Send dokument til Nav',
  'Send inn dokumentasjon til skjema': 'Send inn dokumentasjon til skjema',
  'Send inn etterspurt dokumentasjon til skjema': 'Send inn etterspurd dokumentasjon til skjema',
  'Send inn etterspurt dokumentasjon': 'Send inn etterspurd dokumentasjon',
  'Denne tjenesten er under utvikling.': 'Denne tenesta er under utvikling.',
  'Beklager, fant ikke siden': 'Beklagar, fann ikkje sida',
  'Gå til forsiden': 'Gå til framsida',
};

const publishedGlobalTranslations: Record<string, Record<string, string>> = { en, nn };

export default publishedGlobalTranslations;
