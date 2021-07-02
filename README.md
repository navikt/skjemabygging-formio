# Monorepo for bygger og fyllut

Byggeren lar deg bygge form.io-skjemaer. Publisering av skjema vil bli en ny commit i
[skjemautfylling-formio repoet](https://github.com/navikt/skjemautfylling-formio),
og disse dataene vil så deployes sammen med fyllut.

# Utvikling

| Kommando  | Beskrivelse |
| ------------- | ------------- |
| yarn bootstrap  | laster ned avhengigheter, og symlink'er inn felleskoden i node_modules der den brukes |
| yarn watch  | transpilerer felleskoden når den endres |
| yarn start  | starter både bygger og fyllut, inkludert backend |
| yarn start:bygger  | starter bygger, inkludert backend |
| yarn start:fyllut  | starter fyllut, inkludert backend |
| yarn build  | bygger react-applikasjonene, ikke nødvendig for lokal utvikling (bruk start og watch) |
| yarn test  | kjører alle tester |
| yarn clean  | sletter node_modules for alle pakker i monorepoet |

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #skjemadigitalisering.
