# Kjøre Formio API server lokalt

Opprett en .env-fil i denne mappen, og legg inn verdier for følgende miljøvariabler:

    LICENSE_KEY=<formio-license-key>
    MONGO=mongodb+srv://<cluster-host>/<dbname>?retryWrites=true&w=majority
    MONGO_CONFIG={"auth": {"username":"<username>", "password": "<password>"}}

`LICENSE_KEY` ligger i [Secret Manager](https://console.cloud.google.com/security/secret-manager) ->
secret`formio-api-server`, og `MONGO` og `MONGO_CONFIG` finner man ved å logge på
[MongoDB Cloud](https://cloud.mongodb.com/).

Start så api-serveren lokalt med `docker-compose up`, og deretter kan man legge inn localhost-url i .env-filen
under `packages/bygger/server`:

    FORMIO_PROJECT_URL=http://localhost:4000/jvcemxwcpghcqjn

NB! Vi kjører opp api-serveren uten portalen på grunn av at portalen krever å kjøre på port 3000 for å
fungere lokalt.

## Egen database for testing

Det ligger en kopi av produksjonsdatabasen som kjører i et eget cluster med navn ClusterDev på
[MongoDB Cloud](https://cloud.mongodb.com/). Tanken er at vi kan bruke denne under utvikling
slik at vi ikke risikerer å ødelegge skjemaer som er ment for produksjon, og at vi da står
friere til å herje som vi vil med dataene.

Vi har også mulighet til å sette opp deploy av en api-server i dev-gcp som går mot denne kopien slik at vi
ikke trenger å kjøre opp api-serveren lokalt.

For å hente data fra produksjon på nytt kan man først slette databasen i ClusterDev,
og deretter bruke `mongodump` og `mongorestore` for en ny kopi:

    mongodump 'mongodb+srv://<prod-user>:<prod-password>@<prod-host>' --readPreference=secondary --archive="backup_db" --db=<dbname>

    mongorestore 'mongodb+srv://<dev-user>:<dev-password>@<dev-host>' --archive="backup_db"
