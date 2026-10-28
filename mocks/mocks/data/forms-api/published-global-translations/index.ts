// Published global translations keyed by bokmål text, as served by forms-api
// GET /v1/published-global-translations/{languageCode}.
const en: Record<string, string> = {
  'Send dokumenter til Nav': 'Send documents to Nav',
  'Send inn dokumentasjon til skjema': 'Submit documentation for a form',
  'Send inn etterspurt dokumentasjon til skjema': 'Submit requested documentation for a form',
  'Send inn etterspurt dokumentasjon': 'Submit requested documentation',
  'Send inn etterspurt dokumentasjon fra varsel': 'Submit requested documentation from a notification',
  'Beklager, fant ikke siden': 'Sorry, we could not find the page',
  'Gå til forsiden': 'Go to the front page',
};

const nn: Record<string, string> = {
  'Send dokumenter til Nav': 'Send dokument til Nav',
  'Send inn dokumentasjon til skjema': 'Send inn dokumentasjon til skjema',
  'Send inn etterspurt dokumentasjon til skjema': 'Send inn etterspurd dokumentasjon til skjema',
  'Send inn etterspurt dokumentasjon': 'Send inn etterspurd dokumentasjon',
  'Send inn etterspurt dokumentasjon fra varsel': 'Send inn etterspurd dokumentasjon frå varsel',
  'Beklager, fant ikke siden': 'Beklagar, fann ikkje sida',
  'Gå til forsiden': 'Gå til framsida',
};

const publishedGlobalTranslations: Record<string, Record<string, string>> = { en, nn };

export default publishedGlobalTranslations;
