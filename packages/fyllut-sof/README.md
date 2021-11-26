# POC Fyllut som SMART on FHIR app

I prossessen med å "pakke ned" #team-helseopplysninger har jeg bygd en
enkel POC som demonstrere hvordan man kunne kjørt stort sett den samme koden som
`fyllut` i smart on fhir.

## Backend

Bare å bruke samme urler, oppsett og backend som `fyllut`. For å bygge docker imaget må serveren
lenkes. Dette gjøres enkelt fra `ln -s ../fyllut/server`.

## Docker Compose

Har embeddet ett `docker-compose` oppsett for å kjøre smart on fhir appen i den offesielle
launchheren. Dette oppsettet skal fungere for Docker Desktop og `minikube`. Sistnevnte har
jeg fortstått skal bli en erstatningen for Docker Desktop.

Oppsettet bruker default `host.docker.internal` som internt hostname. Kort fortalt er dette
ett hostname som innenfor compose-oppsettet resolver til en IP-adresse på innsiden av clusteret
og som samtidig fungerer på utsiden. For å kjøre med minikube, eller andre (hva det nå skulle være)
så kan du legge en `./fyllup-sof/.env`-fil som inneholder kun en variabel:

```
INTERNAL_HOST=host.minikube.internal
```

Dette vil da fungere for oppsett med minikube. Forøvrig må da `/etc/hosts` oppdateres til å inkludere
en mapping mellom minikubes eksterne IP (`minikube ip`) og hostnamet `host.minikube.internal`.

### Smart launcher

Oppsette består av følgende åpne kode:

-   https://github.com/smart-on-fhir/patient-browser
-   https://github.com/smart-on-fhir/smart-launcher

Denne kan du finne på `https://launch.smarthealthit.org/`, men inneholder da ingen norske profiler
som feks helsepersonellnummer (HPR) og personnummer/fødselsnummer.

### HAPI FHIR server

Det ligger med en HAPI-server i docker-compose oppsettet. Dette er bare
for å kunne lagre testdata. HAPI er referanseimplementasjonen fra HL7.

-   https://hapifhir.io/

### Eksempeldata

Ligger i mappen `./example_data/data`. Dette er data tjuvlånt fra FKR
og som er bygget på de norske standardene. Dette gjør at vi kan kjøre tester mot de norske profilene av FHIR
data som er forventet å bli levert fra alle pasientjournaler
som vi integrerer mot.

Testdata lastes på HAPI ved oppstart ved hjelp av det scriptet som ligger på `./example_data/script.js`.
