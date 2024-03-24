# Monorepo for bygger og fyllut

Byggeren lar deg bygge form.io-skjemaer. Publisering av skjema vil bli en ny commit i
[skjemautfylling-formio repoet](https://github.com/navikt/skjemautfylling-formio),
og disse dataene vil så deployes sammen med fyllut.

# Utvikling

## Installere pakker lokalt

For å installere npm-pakker med @navikt-scope må man autentisere seg for registry `npm.pkg.github.com`,
så hvis man får `401 Unauthorized` eller `Couldn't find package "@navikt/<pkgname>" required by "<other-pkgname>"
on the "npm" registry.` ved installering må man kjøre følgende kommando:

    npm login --scope=@navikt --registry=https://npm.pkg.github.com

Logg på med github-brukernavn, og passordet man skal oppgi er et personlig access token (classic) som kan
genereres under [developer settings på GitHub](https://github.com/settings/tokens).
Token trenger kun `read:packages`. Husk å enable SSO for navikt-orgen!

_(Les mer om bruk av Github npm registry i NAV her: https://github.com/navikt/frontend#github-npm-registry)_

## Kommandoer

| Kommando            | Beskrivelse                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| yarn install        | laster ned avhengigheter                                                     |
| yarn start          | starter både bygger og fyllut, inkludert backend                             |
| yarn start:bygger   | starter bygger, inkludert backend                                            |
| yarn start:fyllut   | starter fyllut, inkludert backend                                            |
| yarn build          | bygger react-applikasjonene, ikke nødvendig for lokal utvikling (bruk start) |
| yarn preview:bygger | starter bygger fra dist-mappen                                               |
| yarn preview:fyllut | starter fyllut fra dist-mappen                                               |
| yarn test           | kjører alle tester                                                           |
| yarn test:coverage  | kjører alle tester med rapportering av dekningsgrad                          |
| yarn cypress:bygger | kjører Cypress-tester for bygger                                             |
| yarn cypress:fyllut | kjører Cypress-tester for fyllut                                             |
| yarn mocks:fyllut   | starter Mocks Server for fyllut, brukes ved kjøring av Cypress-tester        |
| yarn check-types    | sjekker at typene er korrekte                                                |
| yarn clean          | sletter node_modules / dist / build / coverage for alle pakker i monorepoet  |
| yarn lint           | se etter problemer i koden                                                   |

## Lokal konfigurasjon med dotenv

Vi bruker hovedsaklig [dotenv](https://www.npmjs.com/package/dotenv) for å konfigurere applikasjonene ved kjøring
lokalt, og det er to steder det kan være interessant å opprette .env-filer:

### 1) `packages/bygger-backend/.env`

For å kjøre opp byggeren lokalt er det én miljøvariabel som _må_ settes, og det er `PUSHER_KEY`. Denne finner man ved
å logge på pusher.com (se [avsnitt nedenfor](#pushercom) for instruksjoner), gå til Channel `skjemabyggeren-dev`, og
App Keys i venstremenyen. Eventuelt kan man opprette sin egen Pusher-applikasjon.

### 2) `packages/fyllut-backend/.env`

FyllUt kan startes lokalt uten å sette noen miljøvariabler, men for at alle funksjoner skal fungere så må man legge
inn konfigurasjon i denne filen.

## Feature toggles

I fyllut og bygger styres feature toggles ved hjelp av en miljøvariabel (`ENABLED_FEATURES`) som inneholder en
kommaseparert
liste med navn på features, eventuelt etterfulgt av likhetstegn og `true` (default) eller `false`.

Dette gjør det mulig å enable features i et enkelt miljø ved å sette denne miljøvariabelen
i miljøets nais-config. Lokalt kan man overstyre default feature toggles ved å legge inn miljøvariabelen i en `.env`-fil
under `fyllut-backend` eller `bygger-backend`.

    // Eksempel på hvordan miljøvariabelen kan se ut
    ENABLED_FEATURES="translations,digitalInnsending,autoComplete=true,diff=false"

Eksempelet over ville ført til et featureToggles-objekt som ser slik ut:

    {
      enableTranslations: true,
      enableDigitalInnsending: true,
      enableAutoComplete: true,
      enableDiff: false
    }

## Frontend logger

Både bygger og fyllut har støtte for å logge feil som skjer i frontend. Begge backends har et endepunkt
`/api/log/(info|error)` som tar feilmeldinger fra frontend og logger de.

I fyllut er det for øvrig mulig å konfigurere frontend logger til å kun logge i nettleserens konsoll, noe som kan være
nyttig under debugging lokalt. Dette gjøres ved sette `{"browserOnly":true}` i miljøvariabel `FYLLUT_FRONTEND_LOGCONFIG`:

    FYLLUT_FRONTEND_LOGCONFIG={"enabled":true,"logLevel":"trace","browserOnly":true}

## Kjøre Fyllut lokalt med mellomlagring

Legg til feature toggle `mellomlagring` i `.env`-filen til fyllut for å skru på mellomlagring. For å kjøre lokalt med
mellomlagring skrudd på må du ha en lokal instans av `innsending-api` kjørende.
Se [innsending-api](https://github.com/navikt/innsending-api) for instrukser om hvordan du kan kjøre api-et lokalt. Legg
til url til den lokale instansen av innsending-api i miljøvariabelen `SEND_INN_HOST` i fyllut. For eksempel slik:

    SEND_INN_HOST=http://127.0.0.1:9064

## Teste publisering av skjema på lokal maskin

Byggeren er konfigurert med default-verdier lokalt som sørger for at eventuelle publiseringer blir gjort mot en
test-branch i repo'et [skjemaufylling-formio](https://github.com/navikt/skjemautfylling-formio). Hvilken branch som
benyttes defineres av `PUBLISH_REPO_BASE`, og
default-verdi kan overstyres i `packages/bygger-backend/.env`, men ikke test mot `master` siden det starter
en deploy til produksjon :nerd_face:

For å autentisere deg er det anbefalt å bruke en personlig access token. Det vil gjøre det enklere å spore endringene i
skjemautfylling-formio, siden committene vil ha eieren av tokenet som author. I prod og dev autentiserer byggeren seg
med en app installation token, som genereres av
en [GitHub app](https://github.com/apps/nav-team-fyllut-sendinn-workflows). For å teste publisering lokalt med app
installation token finner du de nødvendige miljøvariablene i secreten `github-app-installation` i Google Cloud Console.

I `packages/bygger-backend/.env` kan man legge inn følgende miljøvariabler:

| Miljøvariabel                        | Beskrivelse                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GITHUB_ACCESS_TOKEN                  | GitHub personal access token (se framgangsmåte i neste avsnitt). Anbefalt måte å autentisere seg lokalt.                                                           |
| GITHUB*CLIENT*...<br/>GITHUB*APP*... | Alternativ autentisering med GitHub app installation token i stedet for personal access token. Se `github-app-installation` i Google Cloud Console Secret Manager. |
| GIT_SHA                              | Gyldig monorepo commit id (skjemabygging-formio), f.eks. `git rev-parse origin/master`                                                                             |
| PUBLISH_REPO_BASE                    | Denne blir satt til test-publishing hvis ikke satt for lokalt utviklingsmiljø                                                                                      |

### Hvordan opprette et personal access token på GitHub

Se [GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
.

Velg `repo` under `scopes`, og _authorize_ dette token for organisasjon `navikt` etter opprettelsen (_Configure SSO_).

## Cypress-tester

### Kjøre mot bygd kode

På GitHub går cypress-testene mot fyllut og bygger kjørende med bygd kode. Lokalt kjører man da først `yarn build`,
og så `yarn preview:bygger` eller `yarn preview:fyllut` (starter app fra dist-mappen). For 'fyllut må man i tillegg
kjøre opp Mocks Server med `yarn mocks:fyllut`. Deretter starter man cypress-testene med `yarn cypress:bygger`
eller `yarn cypress:fyllut`.

### Kjøre mot utviklingsmiljø

Man kan også kjøre cypress-testene mot vanlig utviklingsmiljø, dvs. `yarn start:bygger` eller `yarn start:fyllut`, men
for fyllut må man da bruke verdiene fra `fyllut-backend/.env.test` i `fyllut-backend/.env` og kjøre opp
`yarn mocks:fyllut` pga. at cypress-testene basererer seg på responsdata fra Mocks Server.

Ved kjøring mot lokalt utviklingsmiljø får man ikke testet eventuell logikk som skjer ved lasting av index.html siden
det ikke er den faktiske backenden som håndterer det under lokal utvikling, så hvis noen av testene har sjekker på
koden som kjøres da vil de feile ved kjøring på denne måten.

## Fagsystemsonen

Vi kommuniserer med fagsystemsonen blant annet for å hente enheter og generere førsteside, og det skjer ved kall
via [skjemabygging-proxy](https://github.com/navikt/skjemabygging-proxy) som kjører i fss.

For å få til dette lokalt trenger du å kjøre naisdevice. I tillegg trenger fyllut-backend og bygger-backend tilgang
til sin client secret som miljøvariabel. Variablene kan f.eks legges til i en `.env`-fil i fyllut-backend og
bygger-backend, med innhold `AZURE_APP_CLIENT_SECRET=<den-respektive-appen-sin-client-secret>`. Client secret til
fyllut og bygger i dev-gcp finner du ved å gå inn i dev-gcp clusteret med kubectl (krever naisdevice og tilgang
til google cloud) og hente ut miljøvariabler fra podden, f.eks slik:

`kubectl exec <pod-name> -c [skjemabygging-formio|skjemautfylling] -- env`

## Brukeradministrasjon

### Bygger

I byggeren logger vi inn med [Azure AD](https://doc.nais.io/security/auth/azure-ad/sidecar/), bortsett fra under
utvikling på lokal maskin, hvor utviklerene logger inn
med [Formio-brukere](https://help.form.io/userguide/user-authentication).
Se [oppretting av bruker](#opprette-formio-bruker-for-lokal-utvikling).

I Azure AD er det opprettet grupper for tilgangsstyring til ulike funksjoner i applikasjonen. Gruppene har prefiks
"Skjemabygging", og kan søkes fram på Microsofts
[Access Panel Groups](https://account.activedirectory.windowsazure.com/r#/groups).
_Eierene_ av gruppene kan legge til nye medlemmer.

En oversikt over gruppenes id'er vil dessuten ligge i koden for bygger backend såfremt de faktisk er i bruk:

-   [azureAd.ts](https://github.com/navikt/skjemabygging-formio/tree/master/packages/bygger-backend/src/middleware/azureAd.ts)

### Opprette Formio-bruker for lokal utvikling

-   Logg inn på https://formio-api.intern.dev.nav.no med brukernavn og passord fra Google Secrets
-   Velg `Nav Skjemabase` -> `User` -> `Use` og skriv inn ønsket brukernavn/passord

### Fyllut

Fyllut støtter uinnlogget utfylling av skjemaer, men har også mulighet for innlogging med
[ID-porten](https://doc.nais.io/security/auth/idporten/sidecar/) for å kunne benytte digital innsending.

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

    # pwd => packages/fyllut -> fyllut-base med skjema fra formio-api
    docker build --tag fyllut-base -f Dockerfile-base --build-arg git_sha=local .
    docker run -e FORMS_SOURCE=formioapi -e IDPORTEN_JWKS_URI=http://test.no \
       -e FORMIO_PROJECT_URL=https://formio-api.intern.dev.nav.no/jvcemxwcpghcqjn \
       -e NAIS_CLUSTER_NAME=dev-gcp -p 8080:8080 fyllut-base

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

Interne henvendelser kan sendes via Slack i kanalen #team-fyllut-sendinn
