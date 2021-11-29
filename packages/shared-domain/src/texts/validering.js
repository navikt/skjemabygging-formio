export const validering = {
  //Generelle feilmeldinger
  error: "For å gå videre må du rette opp følgende:",
  invalid_email: "{{field}} må være en gyldig epost-adresse.",
  invalid_regex: "{{field}} passer ikke til uttrykket {{regex}}.",
  mask: "Dette er ikke et gyldig {{field}}.",
  max: "{{field}} kan ikke være større enn {{max}}.",
  min: "{{field}} kan ikke være mindre enn {{min}}.",
  maxLength: "{{field}} kan ikke være mer enn {{length}} tegn.",
  minLength: "{{field}} kan ikke være mindre enn {{length}} tegn.",
  pattern: "{{field}} stemmer ikke med {{pattern}}",
  required: "Du må fylle ut: {{field}}",

  //Dato / tid
  invalid_date: "{{field}} er ikke en gyldig dato.",
  invalid_day: "{{field}} er ikke en gyldig dag.", // eslint-disable-line camelcase
  maxDate: "{{field}} kan ikke inneholde dato etter {{- maxDate}}",
  minDate: "{{field}} kan ikke inneholde dato før {{- minDate}}",
  maxYear: "{{field}} kan ikke være senere enn {{maxYear}}",
  minYear: "{{field}} kan ikke være før {{minYear}}",

  //IBAN
  noIBANProvided: "Gyldig IBAN er ikke oppgitt",
  wrongBBANLength: "Oppgitt IBAN har feil lengde.",
  noIBANCountry: "Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)",
  checksumNotNumber: "Oppgitt IBAN er ugyldig fordi sjekksummen ikke er et tall",
  wrongIBANChecksum: "Oppgitt IBAN har feil sjekksum. Sjekk at du har tastet riktig.",
  invalidIBAN: "Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig.",

  //custom component
  fodselsnummerDNummer: "Dette er ikke et gyldig fødselsnummer eller D-nummer",
  dateNotBeforeFromDate: "Datoen kan ikke være tidligere enn fra-dato",
  dateAfterFromDate: "Datoen må være senere enn fra-dato",
  dateNotBeforeAllowedDate: "Datoen kan ikke være tidligere enn",
  dateInBetween: "Datoen kan ikke være tidligere enn {{minDate}} eller senere enn {{maxDate}}",
  dateNotLaterThanAllowedDate: "Datoen kan ikke være senere enn",
};
