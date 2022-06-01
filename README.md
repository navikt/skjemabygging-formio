# Monorepo for bygger og fyllut

Byggeren lar deg bygge form.io-skjemaer. Publisering av skjema vil bli en ny commit i
[skjemautfylling-formio repoet](https://github.com/navikt/skjemautfylling-formio),
og disse dataene vil så deployes sammen med fyllut.

# Utvikling

| Kommando           | Beskrivelse                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| yarn bootstrap     | laster ned avhengigheter, og symlink'er inn felleskoden i node_modules der den brukes |
| yarn watch         | transpilerer felleskoden når den endres                                               |
| yarn start         | starter både bygger og fyllut, inkludert backend                                      |
| yarn start:bygger  | starter bygger, inkludert backend                                                     |
| yarn start:fyllut  | starter fyllut, inkludert backend                                                     |
| yarn build         | bygger react-applikasjonene, ikke nødvendig for lokal utvikling (bruk start og watch) |
| yarn test          | kjører alle tester                                                                    |
| yarn test:coverage | kjører alle tester med rapportering av dekningsgrad                                   |
| yarn cypress       | kjører Cypress-tester                                                                 |
| yarn check-types   | sjekker at typene er korrekte                                                         |
| yarn clean         | sletter node_modules / dist / build / coverage for alle pakker i monorepoet           |
| yarn lint          | se etter problemer i koden                                                            |

## Lokal konfigurasjon med dotenv

Vi bruker hovedsaklig [dotenv](https://www.npmjs.com/package/dotenv) for å konfigurere applikasjonene ved kjøring
lokalt, og det er to steder det kan være interessant å opprette .env-filer:

### 1) `packages/bygger/server/.env`

For å kjøre opp byggeren lokalt er det én miljøvariabel som _må_ settes, og det er `PUSHER_KEY`. Denne finner man ved
å logge på pusher.com (se [avsnitt nedenfor](#pushercom) for instruksjoner), gå til Channel `skjemabyggeren-dev`, og
App Keys i venstremenyen. Eventuelt kan man opprette sin egen Pusher-applikasjon.

### 2) `packages/fyllut/server/.env`

FyllUt kan startes lokalt uten å sette noen miljøvariabler, men for at alle funksjoner skal fungere så må man legge
inn konfigurasjon i denne filen.

## Teste publisering av skjema på lokal maskin

Byggeren er konfigurert med default-verdier lokalt som sørger for at eventuelle publiseringer blir gjort mot en
test-branch i repo'et skjemaufylling-formio. Hvilken branch som benyttes defineres av `PUBLISH_REPO_BASE`, og
default-verdi kan overstyres i `packages/bygger/server/.env`, men ikke test mot `master` siden det starter
en deploy til produksjon :nerd_face:

I `packages/bygger/server/.env` må man legge inn følgende miljøvariabler:

| Miljøvariabel     | Beskrivelse                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| GITHUB_TEAM_TOKEN | GitHub personal access token (se framgangsmåte i neste avsnitt)                        |
| GIT_SHA           | Gyldig monorepo commit id (skjemabygging-formio), f.eks. `git rev-parse origin/master` |

### Hvordan opprette et personal access token på GitHub

Se [GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

Velg `repo` under `scopes`, og _authorize_ dette token for organisasjon `navikt` etter opprettelsen (_Configure SSO_).

## Fagsystemsonen

Vi kommuniserer med fagsystemsonen blant annet for å hente enheter og generere førsteside, og det skjer ved kall
via [skjemabygging-proxy](https://github.com/navikt/skjemabygging-proxy) som kjører i fss.

For å få til dette lokalt trenger du å kjøre naisdevice. I tillegg trenger fyllut/server og bygger/server tilgang
til sin client secret som miljøvariabel. Variablene kan f.eks legges til i en `.env`-fil i fyllut/server og
bygger/server, med innhold `AZURE_APP_CLIENT_SECRET=<den-respektive-appen-sin-client-secret>`. Client secret til
fyllut og bygger i dev-gcp finner du ved å gå inn i dev-gcp clusteret med kubectl (krever naisdevice og tilgang
til google cloud) og hente ut miljøvariabler fra podden, f.eks slik:

`kubectl exec <pod-name> -c [skjemabygging-formio|skjemautfylling] -- env`

## Feature toggles

### Bygger

Byggeren har en fil i frontend (`featureToggles.js`) som inneholder hardkodede feature toggles.

### Fyllut

I fyllut styres feature toggles ved hjelp av en miljøvariabel (`ENABLED_FEATURES`) som inneholder en kommaseparert
liste med navn på features. Dette gjør det mulig å enable features i et enkelt miljø ved å sette denne miljøvariabelen
i miljøets nais-config. Lokalt kan man f.eks. gjøre det ved å legge inn følgende i `.env`-filen under `fyllut/server`:

    ENABLED_FEATURES="translations,digitalInnsending"

Eksempelet over ville ført til et featureToggles-objekt som ser slik ut:

    {
      enableTranslations: true,
      enableDigitalInnsending: true
    }

## Bygge docker-image for testing av produksjonsbygg lokalt

Dersom man trenger å teste produksjonsbygg av applikasjonene lokalt kan man følge stegene i github-workflow
"build-and-push"-jobben for
[bygger](https://github.com/navikt/skjemabygging-formio/blob/master/.github/workflows/build-and-test.yaml#L34) eller
[fyllut](https://github.com/navikt/skjemautfylling-formio/blob/master/.github/workflows/deploy-fyllut.yaml#L32).
Dette bygger applikasjonen for produksjon. Sørg for å kjøre `yarn clean` før du starter, slett også `node_modules` på
toppnivå, og vær oppmerksom på `working-directory` for hvor kommandoene må kjøres.

Docker-image bygges og startes lokalt på følgende måte:

    # pwd => packages/bygger
    docker build --tag bygger --build-arg git_sha=local .
    docker run -p 8080:8080 bygger

    # pwd => packages/fyllut
    docker build --tag fyllut --build-arg git_sha=local \
       --build-arg skjema_dir=<local-skjema-dir> \
       --build-arg translation_dir=<local-translations-dir> .
    docker run -e DECORATOR_URL="https://www.nav.no/dekoratoren?simple=true" \
       -e FOERSTESIDE_URL="https://www.nav.no/soknader/api/forsteside" \
       -e FORMS_SOURCE=static -p 8080:8080 fyllut

`local-skjema-dir` og `local-translations-dir` må ligge i docker build context,
dvs. inne i `packages/fyllut`.

Har du problemer med kommandoene for å bygge eller kjøre docker-image lokalt, sjekk Dockerfile for forventede
build-arg's, og se nais-config for eventuelle miljøvariabler som må settes for å starte docker-container.

**NB!** Første steg i workflow er at man kjører `prepare-production-build.mjs`. Dette skriptet endrer shared-pakkene
til local dependencies i `package.json`, og de legges til nederst i `yarn.lock`.
Dette er nødvendig ved produksjonsbygg siden vi aldri releaser `shared-domain` og `shared-components`,
men det er viktig at disse endringene ikke sjekkes inn i repoet.

# Pusher.com

Pusher brukes til å varsle innloggede brukere i byggeren når det har blitt deployet en ny versjon av FyllUt,
f.eks. når en skjemadefinisjon har blitt publisert.

Kontoen på [pusher.com](https://pusher.com/) er opprettet med skjemadigitalisering@nav.no (gruppe), og passordet for å
logge på ligger i Google Secret Manager.

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-skjemadigitalisering.
