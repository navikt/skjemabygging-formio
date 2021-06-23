# Monorepo for bygger og utfyller

Byggeren lar deg bygge form.io-skjemaer. Publisering av skjema vil bli en ny commit i
[skjemapublisering-repoet](https://github.com/navikt/skjemapublisering),
og disse dataene vil så deployes sammen med utfylleren.

# Utvikling

| Kommando  | Beskrivelse |
| ------------- | ------------- |
| yarn bootstrap  | laster ned avhengigheter, og symlink'er inn felleskoden i node_modules der den brukes |
| yarn watch  | transpilerer felleskoden når den endres |
| yarn start:bygger  | starter byggeren |
| yarn test  | kjører alle tester |
| yarn clean  | sletter node_modules for alle pakker i monorepoet |

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #skjemadigitalisering.
