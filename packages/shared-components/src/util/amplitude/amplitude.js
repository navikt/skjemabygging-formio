// import amplitude from 'amplitude-js';
import * as amplitude from '@amplitude/analytics-browser';

export const initAmplitude = (apiEndpoint, disableBatch) => {
  const config = {
    serverUrl: apiEndpoint,
    defaultTracking: {
      attribution: true,
      pageViews: false,
      sessions: false,
      fileDownload: false,
      formInteractions: false,
    },
    ingestionMetadata: {
      // Required by https://github.com/navikt/amplitude-proxy
      sourceName: window.location.toString(),
    },
  };

  if (disableBatch) {
    config.flushQueueSize = 1;
  }

  amplitude.init('default', '', config);
};

function createEventData(form, customProperties = {}) {
  return {
    skjemanavn: form.title,
    skjemaId: form.properties ? form.properties.skjemanummer : '',
    ...customProperties,
  };
}

function logAmplitudeEvent(eventName, eventData) {
  return amplitude.track(eventName, eventData).promise.catch((error) => {
    console.error(`failed to log amplitude event ${eventName}`, error);
  });
}

export function loggEventSkjemaApnet(form, innsendingskanal) {
  logAmplitudeEvent('skjema åpnet', createEventData(form, { innsendingskanal }));
}

export function loggEventSkjemaStartet(form) {
  logAmplitudeEvent('skjema startet', createEventData(form));
}

export function loggEventSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd) {
  if (sporsmal && svar) {
    logAmplitudeEvent(
      'skjemaspørsmål besvart',
      createEventData(form, {
        spørsmål: sporsmal,
        spørsmålId: id,
        påkrevd: pakrevd,
      }),
    );
  }
}

export function loggEventSkjemaStegFullfort(form, data) {
  logAmplitudeEvent('skjemasteg fullført', createEventData(form, data));
}

export function loggEventFilterValg(form, data) {
  logAmplitudeEvent('filtervalg', createEventData(form, data));
}

export function loggEventNavigere(form, data) {
  logAmplitudeEvent('navigere', createEventData(form, data));
}

export function loggEventDokumentLastetNed(form, tittel) {
  logAmplitudeEvent('last ned', createEventData(form, { tittel }));
}

export function loggEventSkjemaFullfort(form) {
  return logAmplitudeEvent('skjema fullført', createEventData(form));
}

export function loggEventSkjemaValideringFeilet(form) {
  logAmplitudeEvent('skjemavalidering feilet', createEventData(form));
}

export function loggEventSkjemaInnsendingFeilet(form) {
  logAmplitudeEvent('skjemainnsending feilet', createEventData(form));
}
