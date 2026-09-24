# Canonical test plan model

Use schema version `4`. Store the canonical JSON in the session artifact
directory. The renderer validates required fields before producing other
formats.

```json
{
    "schemaVersion": 4,
    "slug": "pr-2210-party-resolution",
    "title": "Manuell testplan: avsender og bruker",
    "summary": "Kontroller at oppsummeringen skiller mellom avsender og bruker.",
    "scope": {
        "included": [
            "FyllUt viser avsender og bruker som ulike personer i oppsummeringen.",
            "Hvilke personer mottakeren registrerer, kontrolleres i teamloggene eller Joark når en med tilgang følger opp innsendingen."
        ],
        "excluded": ["Endringer i Sendinn er ikke del av denne pull requesten."]
    },
    "collaboration": {
        "withNonDevelopers": true
    },
    "source": {
        "repository": "navikt/skjemabygging-formio",
        "type": "pull-request",
        "number": 2210,
        "url": "https://github.com/navikt/skjemabygging-formio/pull/2210",
        "ref": "feature/shared-party-resolution",
        "commitSha": "0123456789abcdef0123456789abcdef01234567",
        "issue": {
            "number": 2201,
            "url": "https://github.com/navikt/skjemabygging-formio/issues/2201"
        }
    },
    "environment": {
        "name": "preprod-alt",
        "internBaseUrl": "https://fyllut-preprod-alt.intern.dev.nav.no/fyllut",
        "ansattBaseUrl": "https://fyllut-preprod-alt.ansatt.dev.nav.no/fyllut",
        "revisionCheck": {
            "endpoint": "https://fyllut-preprod-alt.intern.dev.nav.no/fyllut/api/config",
            "field": "gitVersion"
        }
    },
    "risks": ["Feil person kan bli registrert som bruker i søknaden."],
    "behaviorAnalysis": [
        {
            "id": "B-01",
            "behavior": "Oppsummeringen viser avsender og bruker som ulike personer.",
            "before": "Avsender og bruker kan fremstå som samme person i oppsummeringen.",
            "intended": "Den som sender inn vises som avsender, mens personen søknaden gjelder vises som bruker.",
            "implemented": "Oppsummeringen viser avsender og bruker hver for seg.",
            "evidence": ["Issue #2201 acceptance criterion 2", "packages/shared-domain/src/party/resolver.ts"],
            "confidence": "high",
            "status": "aligned"
        }
    ],
    "integrations": [
        {
            "id": "INT-01",
            "system": "innsending-api",
            "behaviorIds": ["B-01"],
            "evidence": {
                "options": [
                    {
                        "id": "team-logs",
                        "audience": "public",
                        "method": "Teamlogger i GCP",
                        "owner": "Utvikler med tilgang til team-soknad-dev",
                        "url": "https://console.cloud.google.com/logs?project=team-soknad-dev",
                        "instructions": [
                            "Velg tidsrom rundt testtidspunktet og finn samme innsending i loggene fra innsending-api og soknadsarkiverer. Søk på innsendings-ID hvis den er kjent, ellers skjemanummer og tidspunkt.",
                            "Noter hva hver tjeneste viser. Hvis loggene viser begge identitetene for samme innsending, sammenlign bruker med Dine opplysninger og avsender med Avsender. Hvis loggene bare viser status, bruk Joark eller be om etterkontroll."
                        ],
                        "expected": "Når begge feltene er synlige, er bruker og avsender de to ulike syntetiske personene som ble brukt. Status alene bekrefter ikke dette."
                    },
                    {
                        "id": "joark",
                        "audience": "public",
                        "method": "Journalpost i Joark",
                        "owner": "Tester med Joark-tilgang",
                        "instructions": [
                            "Finn journalposten som samsvarer med skjemanummer, testtidspunkt og eventuell innsendingsreferanse.",
                            "Kontroller hvem søknaden gjelder og hvem som sendte inn, hvis begge rollene finnes i journalposten."
                        ],
                        "expected": "Bruker stemmer med Dine opplysninger, avsender med Avsender, og de er ulike personer. Hvis en rolle mangler, er kontrollen ikke fullført."
                    },
                    {
                        "id": "handoff",
                        "audience": "public",
                        "method": "Ingen tilgang til teamlogger eller Joark",
                        "owner": "Tester uten innsyn",
                        "instructions": [
                            "Noter miljø, testtid med tidssone, skjemanummer og skjemasti, innsendingsmåte, begge syntetiske identiteter med hver sin rolle, og det som vises på kvitteringen.",
                            "Del opplysningene med teamet og avtal hvem som følger opp i teamloggene eller Joark."
                        ],
                        "expected": "Teamet har grunnlag for å finne innsendingen. Identitetskontrollen er ikke fullført før en person med tilgang har sjekket den."
                    }
                ]
            }
        }
    ],
    "setupActions": [
        {
            "id": "SETUP-01",
            "audience": "internal",
            "kind": "forms-api-import",
            "title": "Make the test form available",
            "formId": "party-form",
            "steps": ["Dry-run bin/forms-api/import-form.mjs and obtain approval before applying it."],
            "expected": "The form is available in preprod and preprod-alt.",
            "verification": ["Fetch the form from Forms API and check its path and revision."],
            "sharedStateWarning": "preprod and preprod-alt share the same Forms API.",
            "cleanup": ["Delete the generated form with bin/forms-api/cleanup-form.mjs after testing."]
        }
    ],
    "forms": [
        {
            "id": "party-form",
            "kind": "generated",
            "path": "testpartyresolution001",
            "title": "Manuell test - avsender og bruker",
            "artifact": "forms/party-resolution.json",
            "notes": "Bekreft sidene og rekkefølgen i den importerte versjonen."
        }
    ],
    "testCases": [
        {
            "id": "TC-01",
            "group": "Digital innsending",
            "title": "Send inn på vegne av en annen person",
            "mode": "exploratory",
            "behaviorIds": ["B-01"],
            "integrationIds": ["INT-01"],
            "priority": "P0",
            "purpose": "Undersøk hvordan oppsummeringen viser personen søknaden gjelder og innsenderen.",
            "formId": "party-form",
            "journeyCheck": {
                "status": "unverified",
                "route": "Send digitalt uten å logge inn, bruker og avsender som to ulike personer",
                "note": "Den importerte skjemarevisjonen og sidene etter introduksjonen er ikke gjennomgått.",
                "evidence": []
            },
            "prerequisites": ["Ha to godkjente syntetiske identiteter og en syntetisk legitimasjonsfil tilgjengelig."],
            "testUsers": ["Bruker og avsender må være to ulike syntetiske personer."],
            "steps": [
                {
                    "action": "Velg «Send digitalt uten å logge inn».",
                    "expected": "Noter om «Legitimasjon» vises."
                },
                {
                    "action": "Velg legitimasjonstype, last opp den syntetiske legitimasjonsfilen og gå videre.",
                    "expected": "Noter bekreftelsen på opplastingen og hvilken side som vises videre."
                },
                {
                    "action": "Bekreft erklæringen på introduksjonssiden og gå videre.",
                    "expected": "Noter hvilke sider som vises før første utfyllingsside."
                },
                {
                    "action": "Finn siden for personen søknaden gjelder, fyll den ut og gå videre.",
                    "expected": "Noter sidens navn og hvilken side som vises etterpå."
                },
                {
                    "action": "Finn siden for avsender, fyll inn den andre personen og gå til oppsummeringen.",
                    "expected": "Noter hvordan begge personene vises i oppsummeringen."
                },
                {
                    "action": "Send inn søknaden.",
                    "expected": "Noter hva som vises etter innsending, inkludert eventuell kvittering og mottaksdato."
                }
            ],
            "evidence": [
                "Noter testtid med tidssone, skjemanummer, innsendingsmåte og resultat.",
                "Noter innsendings-ID hvis den vises. Del hvilke godkjente syntetiske identiteter som var bruker og avsender med teamet ved behov for etterkontroll."
            ],
            "cleanup": []
        }
    ]
}
```

## Field rules

- `slug` must contain lowercase letters, numbers, and hyphens only.
- `collaboration.withNonDevelopers` records the caller's answer. `true` produces
  HTML and Slack Canvas. `false` produces a GitHub issue document.
- Use `scope.included` and `scope.excluded` to separate implemented PR behavior
  from criteria that remain for later work. The renderer shows both to testers.
- `source.commitSha` must be the exact 40-character commit under test.
- `source.type` must be `pull-request`. `source.number` and `source.url` must
  identify the implementation pull request, even when the skill started from an
  issue.
- Include `source.issue` when an issue exists. Omit it only when the caller
  confirms that the change has no issue.
- `environment.internBaseUrl` and `environment.ansattBaseUrl` must identify both
  FyllUt ingresses. The renderer appends the form path.
- `environment.revisionCheck` must identify the config endpoint and response
  field that expose the deployed application revision. For Bygger changes,
  resolve the missing revision method as described in
  [analysis-workflow.md](analysis-workflow.md) before generating a plan.
- `behaviorAnalysis` must contain the behavior matrix used to derive the test
  plan. Behavior IDs must be unique and match `B-<number>`.
- Behavior confidence is `high`, `medium`, or `low`. Aligned and suspected
  defects require high confidence because their intended result is confirmed.
  Open questions use medium or low confidence.
- Behavior status is `aligned`, `suspected-defect`, or `open-question`.
- `integrations` contains every outbound integration affected by the change.
  Integration IDs must be unique and match `INT-<number>`. Each integration
  references covered behaviors and has concrete evidence instructions.
  Use `evidence.options` for alternative methods. Each option has a unique
  lowercase `id`, `audience` (`public` or `internal`), `method`, `owner`,
  `instructions` (ordered steps), and `expected` (the specific observable
  result). `repositoryReferences` and a URL are optional. For a submission,
  provide separate `team-logs`, `joark`, and `handoff` options as described
  in [integration-evidence.md](integration-evidence.md). The `handoff` option
  must say the downstream check is pending, not passed.
- Every integration must be linked from at least one test case. If no approved
  evidence method exists, resolve that question before creating verification
  cases.
- `setupActions` contains structured setup. IDs match `SETUP-<number>`.
  `audience` is `public` or `internal`; `kind` is `forms-api-import`,
  `form-verification`, `test-user`, `feature-toggle`, `shared-state`, or
  `other`. Every action has steps, an expected result, verification, and
  cleanup.
- A `forms-api-import` setup action must reference a form and include a
  shared-state warning and cleanup. Cleanup may state an approved restore or
  retention decision instead of deletion.
- Case IDs must be unique and match `TC-<number>`.
- Every case must reference one or more entries in `behaviorAnalysis`.
- `integrationIds` references the outbound integrations exercised by the case.
- `risks`, and the case fields `prerequisites`, `testUsers`, `evidence`, and
  `cleanup`, may be omitted when empty. The renderer treats them as empty lists.
- Case mode is `verification` or `exploratory`.
- A verification case may reference `aligned` or `suspected-defect` behaviors
  with high confidence, and its route must be checked. Its expected results
  must come from confirmed intent, an established contract, or unchanged
  baseline behavior. A suspected defect will usually make the case fail.
- An exploratory case records observations for an open question or an
  unchecked route. It must not assert transitions that have not been seen.
  Once the route has been checked, update its expected results before
  changing the case to verification.
- Priorities are `P0`, `P1`, `P2`, or `P3`.
- `formId` must reference an entry in `forms`.
- A generated form intended for script import or deletion must use the
  `MANUALTEST-` form-number prefix in its JSON artifact.
- Every case needs `journeyCheck` with `status` (`verified` or `unverified`),
  a Norwegian `route` naming the submission method and branch choices, and a
  Norwegian `note` describing what was seen or remains unchecked. Add
  `evidence` naming the exact form revision and walkthrough or test that
  confirms the route; it must be nonempty for a verified route. For generated
  forms, check the exact JSON before import and the imported revision before
  publication. Two cases using one form may have different route statuses.
  Metadata, schema checks, and HTTP 200 do not verify a route.
- Use arrays of short strings for prerequisites, test users, evidence, and
  cleanup.
- Omit generic test-user instructions. Use `testUsers` only for cases that need
  a user with specific attributes, and describe those attributes as part of the
  case setup.
- Each step has one action and one observable expected result.
- Put a shell command in the optional `steps[].command` field, not in prose
  or `evidence`. The renderer uses a copyable code block in the issue and
  Canvas. Put deletion of local files or state in `cleanup`, not `evidence`.
- `setupActions` must not contain application deployment instructions.
- Do not include secrets or real personal data. The team may share approved
  synthetic identity numbers in its test notes to identify a submission;
  public artifacts contain instructions, not filled-in identity numbers.
- Write fields rendered in public HTML, Slack Canvas, or GitHub issues in
  Norwegian, with terminology from the application, forms, issue, and approved
  specification. Write `internal` setup and evidence fields in English. The
  canonical JSON contains both audiences, so shared fields used by the public
  outputs remain in Norwegian.
