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
    } catch (error) {
      console.error(error);
    }
  });
}

export function loggSkjemaApnet(form) {
  logAmplitudeEvent("skjema åpnet", createEventData(form));
  console.log("Skjema åpnet");
}

export function loggSkjemaStartet(form) {
  logAmplitudeEvent("skjema startet", createEventData(form));
  console.log("Skjema startet");
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
    console.log("Skjemaspørsmål besvart: " + sporsmal);
  }
}

export function loggSkjemaStegFullfort(form, steg) {
  logAmplitudeEvent("skjemasteg fullført", createEventData(form, { steg }));
  console.log("Fullført steg " + steg);
}

export function loggSkjemaFullfort(form, innsendingsType) {
  logAmplitudeEvent("skjema fullført", createEventData(form, { innsendingsType: innsendingsType }));
  console.log("Fullført skjema");
}

export function loggSkjemaValideringFeilet(form) {
  logAmplitudeEvent("skjemavalidering feilet", createEventData(form));
  console.log("Skjemavalidering feilet");
}

export function loggSkjemaInnsendingFeilet(form) {
  logAmplitudeEvent("skjemainnsending feilet", createEventData(form));
  console.log("Skjemainnsending feilet");
}
