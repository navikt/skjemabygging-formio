export const validering = {
  // Generelle feilmeldinger
  error: 'For å gå videre må du rette opp følgende:',
  invalid_email: '{{field}} må være en gyldig epost-adresse.',
  invalid_regex: '{{field}} passer ikke til uttrykket {{regex}}.',
  mask: 'Dette er ikke et gyldig {{field}}.',
  max: '{{field}} kan ikke være større enn {{max}}.',
  min: '{{field}} kan ikke være mindre enn {{min}}.',
  maxLength: '{{field}} kan ikke være mer enn {{length}} tegn.',
  minLength: '{{field}} kan ikke være mindre enn {{length}} tegn.',
  pattern: '{{field}} stemmer ikke med {{pattern}}',
  required: 'Du må fylle ut: {{field}}',
  valueIsNotAvailable: '{{field}} er en ugyldig verdi.',

  // Dato / tid
  invalid_date: '{{field}} er ikke en gyldig dato.',
  invalid_day: '{{field}} er ikke en gyldig dag.', // eslint-disable-line camelcase
  maxDate: 'Datoen kan ikke være senere {{maxDate}}',
  minDate: 'Datoen kan ikke være tidligere enn {{minDate}}',
  maxYear: '{{field}} kan ikke være senere enn {{maxYear}}',
  minYear: '{{field}} kan ikke være før {{minYear}}',

  // IBAN
  noIBANProvided: 'Gyldig IBAN er ikke oppgitt',
  wrongBBANLength: 'Oppgitt IBAN har feil lengde.',
  noIBANCountry: 'Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)',
  invalidIBAN: 'Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig.',

  // national identity number
  fodselsnummerDNummer: 'Dette er ikke et gyldig fødselsnummer eller D-nummer',

  // org
  orgNrCustomError: 'Dette er ikke et gyldig organisasjonsnummer',

  // accountNumber
  accountNumberCustomError: 'Dette er ikke et gyldig kontonummer',

  // driving list
  validParkingExpenses: 'Parkeringsutgiftene for {{dato}} må være et gyldig beløp',
  parkingExpensesAboveHundred:
    'Fordi du har parkeringsutgifter over 100 kroner per dag må du sende inn kjørelisten på papir og legge ved kvitteringer som dokumenterer utgiften. Bruk samme søknad, men velg "Send i posten"',
};
