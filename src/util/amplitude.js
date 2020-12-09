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

export function loggStegFullfort(form, steg) {
  if (form) {
    console.log("Fullført steg " + (steg !== undefined ? steg : Formio.forms[Object.keys(Formio.forms)[0]].page));
    logAmplitudeEvent("steg fullført", {
      skjemanavn: form.title,
      skjemId: form.properties.skjemanummer,
      steg: steg !== undefined ? steg : Formio.forms[Object.keys(Formio.forms)[0]].page,
    });
  } else {
    console.log("Form is missing");
  }
}

export function loggSkjemaValideringFeilet(form) {
  console.log("Skjemavalidering feilet");
  if (form) {
    logAmplitudeEvent("skjemavalidering feilet", {
      skjemanavn: form.title,
      skjemaId: form.properties.skjemanummer,
    });
  }
}
