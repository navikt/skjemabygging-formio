# Production form Cypress test plan

182 production forms. One test file per form in this directory.

## Progress

| Status                       | Count |
| ---------------------------- | ----- |
| ✅ Done (all passing)        | 182   |
| ⚠️ Done (with skipped tests) | 0     |
| ❌ Not started               | 0     |

## Process rules

1. **Never start or restart servers.** The user controls both the preview server (`localhost:3001`) and mock server (`localhost:3300`). If a server is down, ask the user to start it.
2. **Run 4 agents at a time** to avoid rate limits.
3. **Update plan and skill as soon as each agent finishes** — don't wait for the other agent before launching the next form.
4. **After each agent completes**, update the skill document (`.github/skills/production-form-cypress-tests/SKILL.md`) with any new learnings.
5. **Validate unvalidated tests** before marking them ✅. Tests created while servers were down need a Cypress run to confirm they pass.
6. **10-minute timeout rule**: If an agent has been running for more than 10 minutes without completing, mark only the failing `it` block(s) with `it.skip`, document the form in the ⚠️ table below, and immediately move on to the next form. Do not use `describe.skip` — keep passing tests running.

## Skipped / needs investigation

| Form | Reason |
| ---- | ------ |

## Running fleets of agents

**Before launching agents**, verify servers are running:

```bash
curl -s http://localhost:3001 -o /dev/null -w "%{http_code}"  # preview — expect 200 or 404
curl -s http://localhost:3300 -o /dev/null -w "%{http_code}"  # mock — expect 200
```

If either server is down, ask the user to start it.

Both servers are **read-only** for these tests — multiple Cypress processes can
run against them simultaneously without conflicts.

When generating tests with agents, provide the agent:

1. The form JSON path: `mocks/mocks/data/forms-api/production-forms/<formPath>.json`
2. A reference to the skill: `.github/skills/production-form-cypress-tests/SKILL.md`
3. The reference test: `packages/fyllut/cypress/e2e/production/nav100750.cy.ts`
4. The output path: `packages/fyllut/cypress/e2e/production/<formPath>.cy.ts`

---

## Simple — 0–5 conditionals (30 forms, note: some moved to Medium after recount)

| Done | Form       | Simple | Custom | Both | Panels | Submission                     | Intro | Title                                                                           |
| ---- | ---------- | ------ | ------ | ---- | ------ | ------------------------------ | ----- | ------------------------------------------------------------------------------- |
| ✓    | nav020806  | 4      | 0      | 0    | 6      | none                           |       | Skjema for arbeidsgiver – bekreftelse på utsending uten lønn                    |
| ✓    | nav031601  | 4      | 0      | 0    | 5      | PAPER                          |       | Søknad om godskriving av omsorgsopptjening — 5/5 passing                        |
| ✓    | nav040201  | 0      | 0      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om utstedelse av attest PD U2 — 1/1 passing                              |
| ✓    | nav040307  | 1      | 4      | 0    | 4      | PAPER,DIGITAL                  |       | Egenerklæring - overdragelse av lønnskrav — 5/5 passing                         |
| ✓    | nav082005  | 4      | 2      | 0    | 5      | PAPER                          |       | Søknad om unntak fra arbeidsgiveransvar for sykepenger — 3/3 passing            |
| ✓    | nav082012  | 8      | 0      | 0    | 7      | PAPER                          |       | Krav fra arbeidsgiveren om refusjon av sykepenger — 5/5 passing                 |
| ✓    | nav082105  | 5      | 0      | 0    | 5      | PAPER                          |       | Forsikring mot ansvar for sykepenger i arbeidsgiverperioden — 4/4 passing       |
| ✓    | nav082115  | 8      | 0      | 0    | 8      | PAPER                          |       | Forsikring mot ansvar for sykepenger i arbeidsgiverperioden — 4/4 passing       |
| ✓    | nav083002  | 3      | 2      | 0    | 6      | PAPER                          |       | Trekkopplysninger for arbeidstaker som skal ha sykepenger — 6/6 passing         |
| ✓    | nav100704  | 0      | 4      | 0    | 5      | PAPER,DIGITAL_NO_LOGIN         |       | Fullmakt i forbindelse med søknad om tekniske hjelpemidler — 3/3 passing        |
| ✓    | nav100711  | 0      | 0      | 0    | 3      | PAPER                          |       | Innsending av førstegangssøknad om ortopedisk hjelpemiddel — 1/1 passing        |
| ✓    | nav100713  | 0      | 0      | 0    | 3      | PAPER                          |       | Innsending av søknad om fornyelse av ortopedisk hjelpemiddel — 1/1 passing      |
| ✓    | nav100743  | 2      | 0      | 0    | 7      | PAPER                          |       | Tilleggsskjema fra ergo- eller fysioterapeut — 3/3 passing                      |
| ✓    | nav100753  | 1      | 4      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om dekning av ekstraordinære veterinærutgifter — 5/5 passing             |
| ✓    | nav110307  | 2      | 0      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om å beholde arbeidsavklaringspenger under opphold — 3/3 passing         |
| ✓    | nav111224b | 0      | 5      | 0    | 4      | PAPER,DIGITAL                  |       | Refusjon av utgifter til daglig reise med bruk av egen bil — 4/4 passing        |
| ✓    | nav120615  | 3      | 0      | 0    | 4      | PAPER,DIGITAL                  |       | Bekreftelse på vedtak om uføretrygd — 3/3 passing                               |
| ✓    | nav130021  | 3      | 0      | 0    | 5      | PAPER                          |       | Skadeforklaring ved arbeidsulykke — 5/5 passing                                 |
| ✓    | nav140508  | 3      | 0      | 0    | 7      | PAPER                          |       | Søknad om engangsstønad ved adopsjon — 4/4 passing                              |
| ✓    | nav190110  | 4      | 0      | 0    | 7      | PAPER                          |       | Endring av alderspensjon — 2/2 passing                                          |
| ✓    | nav210305  | 0      | 0      | 0    | 2      | PAPER                          |       | Leveattest — 1/1 passing                                                        |
| ✓    | nav230505  | 0      | 0      | 0    | 4      | none                           |       | Terminoppgave for produktavgift til folketrygden — 1/1 passing                  |
| ✓    | nav250118  | 4      | 1      | 0    | 3      | PAPER                          | ✓     | Søknad om tilgang til Aa-registeret for bostyrere — 4/4 passing                 |
| ✓    | nav341601  | 1      | 4      | 0    | 4      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Melding om tildelt barnehageplass — 4/4 passing                                 |
| ✓    | nav550071  | 0      | 4      | 0    | 4      | DIGITAL,PAPER,DIGITAL_NO_LOGIN |       | Uttalelse i barnebidragssaken din — 3/3 passing                                 |
| ✓    | nav760715  | 3      | 0      | 0    | 3      | none                           |       | Avtale om egenfinansiering av utdanning — 4/4 passing                           |
| ✓    | nav761303  | 0      | 4      | 0    | 5      | none                           |       | Innsøk til Varig tilrettelagt arbeid (VTA) — 4/4 passing                        |
| ✓    | nav761352  | 0      | 0      | 0    | 3      | none                           |       | Avtale om medfinansiering – VTA — 1/1 passing                                   |
| ✓    | nav761354  | 0      | 0      | 0    | 6      | PAPER                          |       | Refusjonskrav – Varig tilrettelagt arbeid (VTA) i ordinær bedrift — 1/1 passing |
| ✓    | nav761385  | 3      | 0      | 0    | 7      | PAPER                          |       | Refusjonskrav - mentor — 5/5 passing                                            |
| ✓    | nav761389  | 3      | 0      | 0    | 6      | PAPER                          |       | Refusjonskrav - inkluderingstilskudd                                            |
| ✓    | nav761390  | 0      | 0      | 0    | 4      | PAPER                          | ✓     | Refusjonskrav til ekspertbistand                                                |

---

## Medium — 6–20 conditionals (66 forms)

| Done | Form       | Simple | Custom | Both | Panels | Submission                     | Intro | Title                                                                            |
| ---- | ---------- | ------ | ------ | ---- | ------ | ------------------------------ | ----- | -------------------------------------------------------------------------------- |
| ✓    | nav001004  | 6      | 3      | 0    | 7      | PAPER,DIGITAL                  | ✓     | Registrering av aktivitet ved import av dagpenger                                |
| ✓    | nav020808  | 11     | 0      | 0    | 7      | none                           |       | Skjema for arbeidsgiver – bekreftelse på utsending i EØS                         |
| ✓    | nav031605  | 3      | 4      | 0    | 5      | PAPER,DIGITAL_NO_LOGIN,DIGITAL |       | Søknad om pensjonsopptjening for omsorgsarbeid                                   |
| ✓    | nav031610  | 11     | 0      | 0    | 5      | PAPER                          |       | Overføring av omsorgsopptjening                                                  |
| ✓    | nav040608  | 17     | 2      | 0    | 9      | PAPER,DIGITAL                  |       | Søknad om dagpenger under etablering av egen virksomhet                          |
| ✓    | nav040610  | 7      | 0      | 0    | 4      | none                           |       | Næringsfaglig vurdering av etableringsplaner                                     |
| ✓    | nav080906  | 11     | 6      | 0    | 7      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Egenerklæring for utenlandske sykemeldinger                                      |
| ✓    | nav080907  | 4      | 4      | 0    | 6      | PAPER                          |       | Søknad om å beholde sykepenger under opphold i utlandet                          |
| ✓    | nav081401  | 13     | 1      | 0    | 7      | PAPER                          |       | Søknad om refusjon av reisetilskudd til arbeidsreiser                            |
| ✓    | nav082020  | 14     | 0      | 0    | 5      | PAPER                          |       | Søknad om unntak fra arbeidsgiveransvar for sykepenger                           |
| ✓    | nav083001  | 21     | 1      | 0    | 5      | PAPER                          |       | Inntektsmelding for sykmeldt arbeidstaker                                        |
| ✓    | nav083501  | 15     | 4      | 1    | 10     | PAPER,DIGITAL                  |       | Inntektsopplysninger for selvstendig næringsdrivende — 17/17 passing             |
| ✓    | nav083605  | 10     | 3      | 0    | 9      | PAPER,DIGITAL                  |       | Søknad fra selvstendig næringsdrivende/frilansere om omsorgspenger               |
| ✓    | nav083606  | 3      | 4      | 0    | 3      | DIGITAL                        |       | Si opp forsikring - Sykepenger — 4/4 passing                                     |
| ✓    | nav084705  | 12     | 0      | 0    | 5      | PAPER,DIGITAL                  |       | Krav om sykepenger – midlertidig ute av inntektsgivende arbeid — 7/7 passing     |
| ✓    | nav100705  | 4      | 4      | 0    | 6      | PAPER                          |       | Bestilling av tekniske hjelpemidler — 8/8 passing                                |
| ✓    | nav100706  | 15     | 4      | 0    | 6      | PAPER,DIGITAL                  |       | Søknad om tolk til døve, døvblinde og hørselshemmede — 10/10 passing             |
| ✓    | nav100708  | 9      | 10     | 0    | 4      | PAPER                          |       | Søknad om høreapparat / tinnitusmaskerer / tilleggsutstyr — 10/10 passing        |
| ✓    | nav100715  | 5      | 4      | 0    | 5      | PAPER                          |       | Søknad om dekning av utgifter til irislinser — 8/8 passing                       |
| ✓    | nav100718  | 16     | 5      | 0    | 8      | PAPER,DIGITAL                  |       | Søknad om stønad til tilpasningskurs — 12/12 passing                             |
| ✓    | nav100723  | 1      | 4      | 0    | 6      | PAPER                          |       | Behov for hjelpemidler knyttet til individuell plan                              |
| ✓    | nav100726  | 9      | 8      | 0    | 8      | PAPER                          |       | Søknad om tilskudd til apper og programvare — 12/12 passing                      |
| ✓    | nav100727  | 11     | 8      | 0    | 8      | PAPER                          |       | Søknad om tilskudd til rimelige hjelpemidler — 12/12 passing                     |
| ✓    | nav100730  | 16     | 3      | 0    | 6      | PAPER                          |       | Søknad om lese- og sekretærhjelp for blinde og svaksynte — 15/15 passing         |
| ✓    | nav100734  | 16     | 1      | 0    | 4      | PAPER                          |       | Tilskudd ved kjøp av briller til barn — 16/16 passing                            |
| ✓    | nav100736  | 7      | 7      | 0    | 5      | PAPER                          |       | Pristilbud for behandlingsbriller eller irislinser — 7/7 passing                 |
| ✓    | nav100742  | 10     | 0      | 0    | 5      | PAPER                          |       | Legeerklæring for motorkjøretøy — 11/11 passing                                  |
| ✓    | nav100744  | 9      | 0      | 0    | 4      | PAPER                          |       | Tilleggsskjema for stønad til kassebil ved utagerende atferd                     |
| ✓    | nav100750  | 7      | 4      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om førerhund                                                              |
| ✓    | nav100754  | 8      | 4      | 0    | 6      | PAPER,DIGITAL                  |       | Søknad om servicehund — 10/10 passing                                            |
| ✓    | nav100755  | 14     | 6      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om stønad til grunnmønster og søm — 14/14 passing                         |
| ✓    | nav100759  | 11     | 8      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om stønad til brystprotese eller spesialbrystholder — 16/16 passing       |
| ✓    | nav100760  | 9      | 5      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om stønad til alminnelig fottøy ved ulik fotstørrelse — 13/13 passing     |
| ✓    | nav100761  | 19     | 4      | 0    | 6      | PAPER,DIGITAL                  |       | Søknad om refusjon av betalt egenandel for fottøy — 11/11 passing                |
| ✓    | nav100763  | 8      | 2      | 0    | 5      | none                           |       | Innlevering av tekniske hjelpemidler — 8/8 passing                               |
| ✓    | nav100780  | 6      | 5      | 0    | 4      | none                           |       | Bekreftelse på utlån og tildeling av høreapparat — 12/12 passing                 |
| ✓    | nav111205  | 3      | 4      | 0    | 6      | PAPER,DIGITAL                  |       | Søknad om reisestønad (AAP) — 6/6 passing                                        |
| ✓    | nav111219b | 15     | 5      | 0    | 7      | PAPER,DIGITAL                  |       | Tilleggsstønad - støtte til bolig og overnatting — 13/13 passing                 |
| ✓    | nav111223b | 6      | 9      | 0    | 6      | PAPER,DIGITAL                  |       | Tilleggsstønad - støtte til flytting — 10/10 passing                             |
| ✓    | nav120607  | 12     | 0      | 0    | 6      | none                           |       | Inntektsskjema for næringsdrivende og ansatt i eget aksjeselskap — 11/11 passing |
| ✓    | nav120609  | 8      | 0      | 0    | 6      | none                           |       | Inntektsskjema for gårdbrukere - uføretrygd — 9/9 passing                        |
| ✓    | nav120901  | 6      | 0      | 0    | 4      | PAPER,DIGITAL                  |       | Søknad om endret inntektsgrense — 6/6 passing                                    |
| ✓    | nav131305  | 4      | 4      | 0    | 5      | PAPER                          |       | Søknad fra selvstendig næringsdrivende og frilansere om AAP — 6/6 passing        |
| ✓    | nav131705  | 11     | 5      | 0    | 7      | PAPER,DIGITAL                  |       | Søknad om menerstatning — 13/13 passing                                          |
| ✓    | nav140507  | 8      | 1      | 0    | 7      | PAPER                          |       | Søknad om engangsstønad ved fødsel — 11/11 passing                               |
| ✓    | nav150801  | 3      | 4      | 0    | 5      | PAPER                          |       | Enslig mor eller far som er arbeidssøker — 9/9 passing                           |
| ✓    | nav180405  | 5      | 5      | 0    | 5      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Søknad om barnepensjon etter fylte 18 år — 10/10 passing                         |
| ✓    | nav250201  | 10     | 0      | 0    | 6      | PAPER                          |       | Oppfølgingsplan ved sykmelding — 10/10 passing                                   |
| ✓    | nav310003  | 7      | 5      | 0    | 10     | PAPER                          |       | Krigspensjoneringen - Krav om etterlattepensjon — 10/10 ✅                       |
| ✓    | nav361301  | 17     | 0      | 0    | 4      | PAPER                          |       | Innsyn med hjemmel — 17/17 ✅                                                    |
| ✓    | nav361302  | 16     | 0      | 0    | 4      | PAPER                          |       | Innsyn med fullmakt eller samtykke — 12/12 ✅                                    |
| ✓    | nav361801  | 14     | 4      | 0    | 4      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Innsyn i egen sak — 9/9 passing                                                  |
| ✓    | nav550060  | 19     | 1      | 0    | 7      | PAPER                          |       | Avtale om barnebidrag — 14/14 ✅                                                 |
| ✓    | nav550063  | 17     | 1      | 0    | 7      | PAPER                          |       | Avtale om barnebidrag for barn over 18 år — 15/15 ✅                             |
| ✓    | nav554401  | 5      | 11     | 0    | 5      | PAPER,DIGITAL_NO_LOGIN         |       | Fordeling av barns reisekostnader ved samvær — 14/14 ✅                          |
| ✓    | nav620016  | 7      | 3      | 0    | 7      | PAPER,DIGITAL                  |       | Opplysningsskjema til Nav for avtalefestet pensjon (AFP) — 10/10 ✅              |
| ✓    | nav760710  | 7      | 4      | 0    | 5      | PAPER,DIGITAL                  |       | Registreringsskjema for tilskudd til utdanning — 8/8 passing                     |
| ✓    | nav761300  | 15     | 4      | 0    | 8      | PAPER,DIGITAL                  | ✓     | Søknad om stønad til arbeids- og utdanningsreiser — 13/13 ✅                     |
| ✓    | nav761318  | 8      | 1      | 0    | 5      | none                           |       | Refusjonskrav - opplæring — 4/4 passing                                          |
| ✓    | nav761353  | 12     | 0      | 0    | 6      | PAPER                          |       | Refusjonskrav – AFT og VTA i skjermet virksomhet — 3/3 passing                   |
| ✓    | nav761380  | 10     | 1      | 0    | 6      | PAPER                          |       | Søknad om funksjonsassistanse — 7/7 passing                                      |
| ✓    | nav761381  | 14     | 6      | 0    | 8      | PAPER                          |       | Refusjonskrav - Funksjonsassistanse — 9/9 passing                                |
| ✓    | nav951509  | 7      | 1      | 0    | 3      | PAPER,DIGITAL                  | ✓     | Samtykke til arbeidsrettet oppfølging for barn under 18 år — 6/6 passing         |
| ✓    | nav952002  | 12     | 8      | 0    | 6      | PAPER,DIGITAL_NO_LOGIN         |       | Melding om frivillig skattetrekk — 12/12 passing                                 |
| ✓    | nav952003  | 11     | 4      | 0    | 6      | DIGITAL                        |       | Melding om frivillig skattetrekk for barnepensjon — 9/9 passing                  |
| ✓    | nav952005  | 9      | 0      | 0    | 5      | PAPER                          |       | Skjema for tips om mulig misbruk av stønad — 4/4 passing                         |

---

## Complex — 21–40 conditionals (41 forms)

| Done | Form       | Simple | Custom | Both | Panels | Submission                     | Intro | Title                                                                                   |
| ---- | ---------- | ------ | ------ | ---- | ------ | ------------------------------ | ----- | --------------------------------------------------------------------------------------- |
| ✓    | nav040203  | 25     | 3      | 0    | 8      | PAPER                          |       | Bekreftelse på ansettelsesforhold — 9/9 passing                                         |
| ✓    | nav040205  | 19     | 9      | 0    | 9      | PAPER,DIGITAL                  |       | Søknad om attest PD U1/N-301 — 10/10 passing                                            |
| ✓    | nav040605  | 21     | 9      | 0    | 15     | PAPER,DIGITAL                  |       | Søknad om å beholde dagpengene mens du tar utdanning — 10/10 passing                    |
| ✓    | nav040803  | 26     | 13     | 1    | 7      | PAPER                          |       | Bekreftelse på sluttårsak/nedsatt arbeidstid — 11/11 passing                            |
| ✓    | nav040804  | 30     | 3      | 0    | 9      | PAPER                          |       | Bekreftelse på arbeidsforhold og permittering — 11/11 passing                           |
| ✓    | nav060702  | 29     | 5      | 0    | 10     | PAPER,DIGITAL,DIGITAL_NO_LOGIN | ✓     | Svar på brev om vurdering av hjelpestønad — 8/8 passing                                 |
| ✓    | nav080708  | 25     | 1      | 0    | 14     | PAPER                          |       | Legeerklæring ved arbeidsuførhet — 10/10 passing                                        |
| ✓    | nav100725  | 16     | 10     | 0    | 11     | PAPER                          |       | Søknad om tilskudd til PC eller nettbrett — 12/12 passing                               |
| ✓    | nav100757  | 30     | 6      | 0    | 6      | PAPER,DIGITAL                  |       | Søknad om stønad til parykk — 12/12 passing                                             |
| ✓    | nav100758  | 22     | 7      | 0    | 5      | PAPER,DIGITAL                  |       | Søknad om stønad til øyeprotese eller ansiktsprotese — 9/9 passing                      |
| ✓    | nav100787  | 33     | 3      | 0    | 10     | PAPER,DIGITAL                  |       | Søknad om synshjelpemidler — 11/11 passing                                              |
| ✓    | nav111215b | 14     | 11     | 0    | 7      | PAPER                          |       | Tilleggsstønad - støtte til pass av barn — 15/15 passing                                |
| ✓    | nav111216b | 14     | 8      | 0    | 5      | PAPER                          |       | Tilleggsstønad - støtte til læremidler — 9/9 passing                                    |
| ✓    | nav111217b | 22     | 9      | 0    | 8      | PAPER,DIGITAL                  |       | Tilleggsstønad - støtte til reise til samling — 16/16 passing                           |
| ✓    | nav111218b | 25     | 9      | 0    | 9      | PAPER,DIGITAL                  |       | Tilleggsstønad - støtte til reise ved oppstart/avslutning — 9/9 passing                 |
| ✓    | nav111219  | 19     | 9      | 0    | 6      | PAPER,DIGITAL                  |       | Pengestøtte til bolig eller overnatting — 12/12 passing                                 |
| ✓    | nav111221b | 25     | 9      | 0    | 8      | PAPER,DIGITAL                  |       | Tilleggsstønad - støtte til daglig reise — 14/14 passing                                |
| ✓    | nav111222b | 25     | 11     | 0    | 7      | PAPER,DIGITAL                  |       | Tilleggsstønad - støtte til reise for å komme i arbeid — 17/17 passing                  |
| ✓    | nav111308  | 15     | 7      | 0    | 9      | PAPER,DIGITAL                  |       | Søknad om arbeidsavklaringspenger under etablering — 13/13 passing                      |
| ✓    | nav111309  | 17     | 7      | 0    | 9      | PAPER,DIGITAL                  |       | Søknad om arbeidsavklaringspenger under etablering — 9/9 passing                        |
| ✓    | nav120606  | 37     | 0      | 0    | 5      | none                           |       | Inntektsskjema for arbeidstakere - uføretrygd — 9/9 passing                             |
| ✓    | nav121401  | 25     | 0      | 0    | 6      | PAPER                          |       | Melding om inntektsendring når du har uføretrygd — 4/4 passing                          |
| ✓    | nav121501  | 27     | 7      | 0    | 6      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Søknad om barnetillegg for deg som har uføretrygd — 10/10 passing                       |
| ✓    | nav140410  | 21     | 4      | 0    | 8      | PAPER                          |       | Søknad om svangerskapspenger til selvstendig næringsdrivende og frilanser — 8/8 passing |
| ✓    | nav171501  | 21     | 4      | 0    | 11     | PAPER,DIGITAL                  |       | Søknad om ytelser til tidligere familiepleier — 11/11 passing                           |
| ✓    | nav190105  | 27     | 7      | 0    | 14     | PAPER                          |       | Søknad om alderspensjon — 16/16 passing                                                 |
| ✓    | nav230301  | 25     | 5      | 0    | 10     | PAPER,DIGITAL                  |       | Inntektsskjema for beregning av trygdeavgift — 11/11 passing                            |
| ✓    | nav310002  | 21     | 8      | 0    | 16     | PAPER                          |       | Krigspensjoneringen - Krav om invalidepensjon — 15/15 passing                           |
| ✓    | nav520501  | 14     | 18     | 1    | 7      | PAPER,DIGITAL                  |       | Melding om at Skatteetaten skal kreve inn barnebidraget — 9/9 passing                   |
| ✓    | nav570008  | 22     | 5      | 0    | 8      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Skjema for oppfostringsbidrag — 11/11 passing                                           |
| ✓    | nav620301  | 16     | 6      | 0    | 5      | PAPER,DIGITAL                  |       | Skjema for tilbakemelding til Nav om inntekt — 6/6 passing                              |
| ✓    | nav760501  | 25     | 8      | 0    | 7      | PAPER,DIGITAL                  |       | Ungdomsprogram - støtte til daglig reise — 12/12 passing                                |
| ✓    | nav760502  | 22     | 8      | 0    | 7      | PAPER,DIGITAL                  |       | Ungdomsprogram - støtte til reise til samling — 9/9 passing                             |
| ✓    | nav760503  | 25     | 8      | 0    | 8      | PAPER,DIGITAL                  |       | Ungdomsprogram - støtte til reise ved oppstart/avslutning — 13/13 passing               |
| ✓    | nav760510  | 17     | 4      | 0    | 6      | PAPER                          | ✓     | Meldekort for tiltakspenger — 6/6 passing                                               |
| ✓    | nav761345  | 21     | 4      | 0    | 7      | PAPER                          | ✓     | Søknad om tiltakspenger — 11/11 passing                                                 |
| ✓    | nav951536  | 22     | 5      | 0    | 6      | PAPER,DIGITAL_NO_LOGIN         |       | Generell fullmakt — 8/8 passing                                                         |
| ✓    | nav952000  | 14     | 14     | 0    | 5      | PAPER                          |       | Melding om nytt bankkontonummer — 13/13 passing                                         |

---

## Very complex — 41+ conditionals (45 forms)

**Strategy: Test only custom conditionals.** Simple conditionals (`{ show, when, eq }`) are well-covered by the simpler forms. For Very complex forms, focus on `customConditional` expressions only — these use JavaScript logic (`data.X`, `row.X`, `instance.isSubmission*()`, includes/indexOf, numeric comparisons) and are harder to verify. Still include one summary flow per form.

| Done | Form      | Simple | Custom | Both | Panels | Submission                     | Intro | Title                                                                              |
| ---- | --------- | ------ | ------ | ---- | ------ | ------------------------------ | ----- | ---------------------------------------------------------------------------------- |
| ✓    | nav070208 | 58     | 44     | 0    | 21     | PAPER,DIGITAL                  |       | Søknad om gravferdsstønad og båretransport — 4/4 passing                           |
| ✓    | nav100606 | 48     | 0      | 0    | 5      | none                           |       | Seksualteknisk hjelpemiddel — 7/7 passing                                          |
| ✓    | nav100710 | 34     | 19     | 0    | 8      | none                           |       | Søknad om ortopedisk hjelpemiddel — 8/8 passing                                    |
| ✓    | nav100714 | 35     | 12     | 1    | 8      | PAPER                          |       | Søknad om briller til forebygging eller behandling av amblyopi — 9/9 passing       |
| ✓    | nav100716 | 63     | 15     | 0    | 10     | PAPER,DIGITAL                  |       | Søknad om refusjon av reiseutgifter - ortopediske hjelpemidler — 15/15 passing     |
| ✓    | nav100717 | 40     | 12     | 0    | 8      | PAPER,DIGITAL                  |       | Søknad om refusjon av reiseutgifter - behandlingsbriller — 13/13 passing           |
| ✓    | nav100719 | 40     | 12     | 0    | 8      | PAPER                          |       | Søknad om refusjon av reiseutgifter - tekniske hjelpemidler — 13/13 passing        |
| ✓    | nav100740 | 70     | 28     | 4    | 13     | PAPER,DIGITAL                  |       | Søknad om stønad til bil og spesialutstyr — 9/9 passing                            |
| ✓    | nav100786 | 38     | 21     | 0    | 11     | PAPER,DIGITAL                  |       | Søknad om hjelpemiddel til kognisjon, kommunikasjon og syn — 11/11 passing         |
| ✓    | nav111221 | 34     | 24     | 5    | 7      | PAPER,DIGITAL                  |       | Pengestøtte til daglige reiser — 10/10 passing                                     |
| ✓    | nav111305 | 33     | 11     | 0    | 11     | PAPER                          |       | Søknad om arbeidsavklaringspenger (AAP) — 13/13 passing                            |
| ✓    | nav120605 | 75     | 10     | 0    | 16     | PAPER,DIGITAL                  |       | Søknad om uføretrygd — 15/15 passing                                               |
| ✓    | nav140506 | 86     | 28     | 0    | 9      | PAPER                          |       | Søknad om foreldrepenger ved adopsjon — 8/8 passing                                |
| ✓    | nav140509 | 88     | 27     | 0    | 9      | PAPER                          |       | Søknad om foreldrepenger ved fødsel — 8/8 passing                                  |
| ✓    | nav141605 | 66     | 29     | 0    | 8      | PAPER                          |       | Søknad om endring eller nytt uttak av foreldrepenger — 7/7 passing                 |
| ✓    | nav150001 | 102    | 19     | 0    | 9      | PAPER                          |       | Søknad om overgangsstønad – enslig mor eller far — 6/6 passing                     |
| ✓    | nav150004 | 33     | 20     | 0    | 10     | PAPER                          |       | Søknad om stønad til skolepenger - enslig mor eller far — 11/11 passing            |
| ✓    | nav170106 | 91     | 62     | 0    | 10     | PAPER                          |       | Søknad om omstillingsstønad — 6/6 passing                                          |
| ✓    | nav170901 | 50     | 1      | 0    | 12     | PAPER                          |       | Søknad om stønad til barnetilsyn — 8/8 passing                                     |
| ✓    | nav180105 | 65     | 55     | 0    | 9      | PAPER                          |       | Søknad om barnepensjon — 6/6 passing                                               |
| ✓    | nav330007 | 149    | 77     | 0    | 24     | PAPER                          |       | Søknad om barnetrygd — 7/7 passing                                                 |
| ✓    | nav530005 | 24     | 26     | 4    | 11     | PAPER,DIGITAL                  |       | Søknad om ektefellebidrag — 12/12 passing                                          |
| ✓    | nav540004 | 183    | 102    | 3    | 14     | PAPER,DIGITAL                  |       | Svar i sak om barnebidrag — 10/10 passing                                          |
| ✓    | nav540005 | 199    | 126    | 1    | 14     | DIGITAL,PAPER                  |       | Søknad om barnebidrag — 6/6 passing                                                |
| ✓    | nav540006 | 187    | 109    | 0    | 17     | PAPER,DIGITAL                  |       | Søknad om barnebidrag etter fylte 18 år — 7/7 passing                              |
| ✓    | nav540009 | 33     | 18     | 0    | 9      | PAPER,DIGITAL                  |       | Søknad om bidragsforskudd — 13/13 passing                                          |
| ✓    | nav540010 | 153    | 100    | 2    | 16     | PAPER,DIGITAL                  |       | Svar i sak om barnebidrag etter fylte 18 år — 6/6 passing                          |
| ✓    | nav540011 | 51     | 13     | 0    | 15     | PAPER,DIGITAL                  |       | Søknad om sletting av bidragsgjeld — 5/5 passing                                   |
| ✓    | nav540013 | 48     | 17     | 0    | 8      | PAPER,DIGITAL,DIGITAL_NO_LOGIN |       | Søknad om særbidrag — 6/6 passing                                                  |
| ✓    | nav540014 | 35     | 29     | 0    | 9      | PAPER,DIGITAL                  |       | Svar i sak om særbidrag — 7/7 passing                                              |
| ✓    | nav640100 | 66     | 20     | 0    | 14     | PAPER                          |       | Supplerende stønad til ufør flyktning                                              |
| ✓    | nav642100 | 73     | 23     | 2    | 14     | PAPER                          |       | Søknad om supplerende stønad til personer over 67 år — 7/7 passing                 |
| ✓    | nav670101 | 48     | 1      | 0    | 14     | none                           |       | Søknad om lønnsgarantidekning — 7/7 passing                                        |
| ✓    | nav670103 | 54     | 0      | 0    | 13     | none                           |       | Opplysninger om boet og kravene (lønnsgaranti) — 13/13 passing                     |
| ✓    | olj000001 | 52     | 62     | 3    | 10     | PAPER,DIGITAL                  | ✓     | Søknad til oljepionernemnda — 6/6 passing                                          |
| ✓    | nav020705 | 40     | 8      | 0    | 13     | PAPER,DIGITAL                  |       | Søknad om frivillig medlemskap i folketrygden — 5/5 passing                        |
| ✓    | nav020805 | 72     | 36     | 1    | 20     | PAPER,DIGITAL                  |       | Søknad om medlemskap i folketrygden under opphold utenfor Norge — 18/18 passing    |
| ✓    | nav020807 | 176    | 27     | 0    | 24     | PAPER,DIGITAL                  |       | Søknad om avklaring av trygdetilhørighet under opphold utenfor Norge — 7/7 passing |
| ✓    | nav040103 | 117    | 11     | 0    | 13     | PAPER                          |       | Søknad om dagpenger (ikke permittert) — 6/6 passing                                |
| ✓    | nav040104 | 69     | 9      | 0    | 13     | PAPER                          |       | Søknad om dagpenger ved permittering — 11/11 passing                               |
| ✓    | nav041603 | 109    | 12     | 0    | 13     | PAPER                          |       | Søknad om gjenopptak av dagpenger — 9/9 passing                                    |
| ✓    | nav041604 | 61     | 11     | 0    | 12     | PAPER                          |       | Søknad om gjenopptak av dagpenger ved permittering — 12/12 passing                 |
| ✓    | nav060304 | 235    | 24     | 2    | 31     | PAPER,DIGITAL,DIGITAL_NO_LOGIN | ✓     | Søknad om grunnstønad — 7/7 passing                                                |
| ✓    | nav060404 | 81     | 16     | 1    | 16     | PAPER,DIGITAL,DIGITAL_NO_LOGIN | ✓     | Søknad om hjelpestønad — 11/11 passing                                             |
| ✓    | nav060701 | 84     | 18     | 0    | 21     | PAPER,DIGITAL,DIGITAL_NO_LOGIN | ✓     | Svar på brev om vurdering av grunnstønad — 6/6 passing                             |
