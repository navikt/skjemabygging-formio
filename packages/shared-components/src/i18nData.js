import { TEXTS, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { flatten, addToMap } = objectUtils;

const i18nData = {
  "nb-NO": {
    //Generelle feilmeldinger
    //Erstattes av filen ../shared-domain/src/texts/validering.js når globale oversettelser er klar
    alertMessage: "{{message}}",
    error: "Vennligst fiks følgende feil:",
    invalid_email: "{{field}} må være en gyldig epost-adresse.",
    invalid_regex: "{{field}} passer ikke til uttrykket {{regex}}.",
    mask: "Dette er ikke et gyldig {{field}}.",
    max: "{{field}} kan ikke være større enn {{max}}.",
    min: "{{field}} kan ikke være mindre enn {{min}}.",
    maxLength: "{{field}} kan ikke være mer enn {{length}} tegn.",
    minLength: "{{field}} kan ikke være mindre enn {{length}} tegn.",
    pattern: "{{field}} stemmer ikke med {{pattern}}",
    required: "Du må fylle ut: {{field}}",

    //Grensesnitt / navigering
    //Erstattes av filen ../shared-domain/src/texts/grensesnitt.js når globale oversettelser er klar
    previous: "Forrige",
    next: "Neste",
    cancel: "Avbryt",
    confirmCancel: "Er du sikker på at du vil avbryte?",
    submit: "Neste",
    optional: "valgfritt",

    //Dato / tid
    //Erstattes av filen ../shared-domain/src/texts/validering.js når globale oversettelser er klar
    invalid_date: "{{field}} er ikke en gyldig dato.",
    invalid_day: "{{field}} er ikke en gyldig dag.", // eslint-disable-line camelcase
    maxDate: "{{field}} kan ikke inneholde dato etter {{- maxDate}}",
    minDate: "{{field}} kan ikke inneholde dato før {{- minDate}}",
    maxYear: "{{field}} kan ikke være senere enn {{maxYear}}",
    minYear: "{{field}} kan ikke være før {{minYear}}",

    //Erstattes av globalt oversatte skjematekster når globale oversettelser er klar
    month: "Måned",
    day: "Dag",
    year: "År",
    january: "Januar",
    february: "Februar",
    march: "Mars",
    april: "April",
    may: "Mai",
    june: "Juni",
    july: "Juli",
    august: "August",
    september: "September",
    october: "Oktober",
    november: "November",
    december: "Desember",

    ...flatten(TEXTS, ([_, value]) => ({ key: value, value })).reduce(addToMap, {}),
  },
  "nn-NO": {},
  en: {},
  pl: {},
};
export default i18nData;
