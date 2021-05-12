import TEXTS from "./texts";

export default {
  "nb-NO": {
    //Generelle feilmeldinger
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
    previous: "Forrige",
    next: "Neste",
    cancel: "Avbryt",
    confirmCancel: "Er du sikker på at du vil avbryte?",
    submit: "Neste",

    //Dato / tid
    invalid_date: "{{field}} er ikke en gyldig dato.",
    invalid_day: "{{field}} er ikke en gyldig dag.", // eslint-disable-line camelcase
    maxDate: "{{field}} kan ikke inneholde dato etter {{- maxDate}}",
    minDate: "{{field}} kan ikke inneholde dato før {{- minDate}}",
    maxYear: "{{field}} kan ikke være senere enn {{maxYear}}",
    minYear: "{{field}} kan ikke være før {{minYear}}",
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
    [TEXTS.summaryPage.title]: TEXTS.summaryPage.title,
    [TEXTS.summaryPage.description]: TEXTS.summaryPage.description,
    [TEXTS.summaryPage.editAnswers]: TEXTS.summaryPage.editAnswers,
    [TEXTS.summaryPage.continue]: TEXTS.summaryPage.continue,
    [TEXTS.summaryPage.continueToPostalSubmission]: TEXTS.summaryPage.continueToPostalSubmission,
    [TEXTS.summaryPage.continueToDigitalSubmission]: TEXTS.summaryPage.continueToDigitalSubmission,
  },
};
