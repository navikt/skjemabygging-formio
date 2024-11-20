# skjemabygging-formio

Skjemabygging lar deg bygge form.io skjemaer. Den bruker form.io
til å tilby en WYSIWYG skjemaeditor. Når man publiserer pushes det en ny
commit til https://github.com/navikt/skjemapublisering repoet.

# Komme i gang

### Kjøre lokalt

| Kommando           | Beskrivelse                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| yarn start         | starter applikasjonen i [localhost:3000](localhost:3000)                     |
| yarn build         | bygger react-applikasjonene, ikke nødvendig for lokal utvikling (bruk start) |
| yarn test          | kjører alle tester                                                           |
| yarn test:coverage | kjører alle tester med rapportering av dekningsgrad                          |
| yarn cypress       | kjører Cypress-tester                                                        |
| yarn cypress:open  | kjører Cypress-tester med browser vindu åpent (husk å kjøre koden ved siden) |
| yarn check-types   | sjekker at typene er korrekte                                                |
| yarn clean         | sletter node_modules / dist / build / coverage                               |

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen #skjemadigitalisering.

# Form.io

## 2 azure ad clienter

1 for byggeren og en for apiet.

Den for apiet lager vi statisk utenfor nais.yml. (Sånn at vi kan bruke
admin grensesnittet).

Etter å ha logget inn så veksler vi token i et token som har rettighet
til å snakke med form.io apiet.

Så veksler vi dette tokenet ved å bruke form.io token swap så vi får
et form.io token som er gyldig for brukeren.

## Endringer i paletter

Vær obs på at ved endringer i paletter må det dras inn en ny komponent i byggeren. (hvis ikke brukes fortsatt den gamle)
