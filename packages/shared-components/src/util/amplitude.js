import amplitude from "amplitude-js";

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
    } catch (error) {
      console.error(error);
    }
  });
}

export function loggEventSkjemaApnet(form, innsendingskanal) {
  logAmplitudeEvent("skjema åpnet", createEventData(form, { innsendingskanal }));
}

export function loggEventSkjemaStartet(form) {
  logAmplitudeEvent("skjema startet", createEventData(form));
}

export function loggEventSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd) {
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

export function loggEventSkjemaStegFullfort(form, data) {
  logAmplitudeEvent("skjemasteg fullført", createEventData(form, data));
}

export function loggEventFilterValg(form, data) {
  logAmplitudeEvent("filtervalg", createEventData(form, data));
}

export function loggEventNavigere(form, data) {
  logAmplitudeEvent("navigere", createEventData(form, data));
}

export function loggEventDokumentLastetNed(form, tittel) {
  logAmplitudeEvent("last ned", createEventData(form, { tittel }));
}

export function loggEventSkjemaFullfort(form) {
  logAmplitudeEvent("skjema fullført", createEventData(form));
}

export function loggEventSkjemaValideringFeilet(form) {
  logAmplitudeEvent("skjemavalidering feilet", createEventData(form));
}

export function loggEventSkjemaInnsendingFeilet(form) {
  logAmplitudeEvent("skjemainnsending feilet", createEventData(form));
}
