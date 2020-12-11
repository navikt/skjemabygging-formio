import { Formio } from "formiojs";

const amplitude = require("amplitude-js");

export const initAmplitude = () => {
  if (amplitude) {
    amplitude.getInstance().init("default", "", {
      apiEndpoint: "amplitude.nav.no/collect-auto",
      saveEvents: false,
      includeUtm: true,
      includeReferrer: true,
      platform: window.location.toString(),
    });
  }
};

function createEventData(form, customProperties = {}) {
  return {
    skjemanavn: form.title,
    skjemaId: form.properties.skjemanummer,
    ...customProperties,
  };
}

export function logAmplitudeEvent(eventName, eventData) {
  setTimeout(() => {
    try {
      if (amplitude) {
        amplitude.getInstance().logEvent(eventName, eventData);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

export function loggSkjemaStartet(form) {
  if (form) {
    logAmplitudeEvent("skjema startet", createEventData(form));
    console.log("Skjema startet");
  }
}

export function loggSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd) {
  if (form && sporsmal && svar) {
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

export function loggStegFullfort(form, steg) {
  if (form) {
    logAmplitudeEvent(
      "skjemasteg fullført",
      createEventData(form, {
        steg: steg !== undefined ? steg : Formio.forms[Object.keys(Formio.forms)[0]].page,
      })
    );
    console.log("Fullført steg " + (steg !== undefined ? steg : Formio.forms[Object.keys(Formio.forms)[0]].page));
  }
}

export function loggSkjemaFullfort(form) {
  if (form) {
    logAmplitudeEvent("skjema fullført", createEventData(form));
    console.log("Fullført skjema");
  } else {
    console.log("Form is missing");
  }
}

export function loggSkjemaValideringFeilet(form) {
  console.log("Skjemavalidering feilet");
  if (form) {
    logAmplitudeEvent("skjemavalidering feilet", createEventData(form));
  }
}

export function loggSkjemaInnsendingFeilet(form) {
  console.log("Skjemainnsending feilet");
  if (form) {
    logAmplitudeEvent("skjemainnsending feilet", createEventData(form));
  }
}
