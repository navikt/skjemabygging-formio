const amplitude = require("amplitude-js");

export const initAmplitude = () => {
  amplitude.getInstance().init("default", "", {
    apiEndpoint: "amplitude.nav.no/collect-auto",
    saveEvents: false,
    includeUtm: true,
    includeReferrer: true,
    platform: window.location.toString(),
  });
};

function createEventData(form, customProperties = {}) {
  return {
    skjemanavn: form.title,
    skjemaId: form.properties ? form.properties.skjemanummer : "",
    ...customProperties,
  };
}

export function logAmplitudeEvent(eventName, eventData) {
  setTimeout(() => {
    try {
      amplitude.getInstance().logEvent(eventName, eventData);
      console.debug(eventName, eventData);
    } catch (error) {
      console.error(error);
    }
  });
}

export function loggSkjemaApnet(form) {
  logAmplitudeEvent("skjema åpnet", createEventData(form));
}

export function loggSkjemaStartet(form) {
  logAmplitudeEvent("skjema startet", createEventData(form));
}

export function loggSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd) {
  if (sporsmal && svar) {
    logAmplitudeEvent(
      "skjemaspørsmål besvart",
      createEventData(form, {
        spørsmål: sporsmal,
        spørsmålId: id,
        påkrevd: pakrevd,
      })
    );
  }
}

export function loggSkjemaStegFullfort(form, steg) {
  logAmplitudeEvent("skjemasteg fullført", createEventData(form, { steg }));
}

export function loggSkjemaFullfort(form, innsendingsType) {
  logAmplitudeEvent("skjema fullført", createEventData(form, { innsendingsType: innsendingsType }));
}

export function loggSkjemaValideringFeilet(form) {
  logAmplitudeEvent("skjemavalidering feilet", createEventData(form));
}

export function loggSkjemaInnsendingFeilet(form) {
  logAmplitudeEvent("skjemainnsending feilet", createEventData(form));
}
