# Canonical test plan model

Use schema version `4`. Store the canonical JSON in the session artifact
directory. [plan.schema.json](plan.schema.json) defines the structure: required
fields, types, enums and ID patterns. The renderer validates against it, then
checks the cross-field rules below, before producing other formats. This file
holds the example and the rules a schema cannot express.

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
        "excluded": ["Endringer i Sendinn er ikke del av denne pull requesten."],
        "notCoveredByTests": [
            {
                "area": "Feil ved utilgjengelig innsending-api",
                "reason": "Kan ikke fremprovoseres pålitelig i delt preprod; dekkes av automatiserte feiltester."
            }
        ]
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
                        "owner": "Utvikler med tilgang til team-soknad-dev-ee5e",
                        "url": "https://console.cloud.google.com/logs/query?project=team-soknad-dev-ee5e",
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
                        "method": "Overlevering",
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
            "steps": [
                "Dry-run the generated MANUALTEST- form import and apply only its confirmed CREATE operation; obtain explicit approval before replacing an existing form."
            ],
            "expected": "The form is available in preprod and preprod-alt.",
            "verification": [
                "Fetch the form from Forms API and check its stored path, revision, components, submission methods, and conditional choices."
            ],
            "sharedStateWarning": "preprod and preprod-alt share the same Forms API.",
            "cleanup": ["Keep the generated form in Forms API; a form owner decides later whether to remove it."]
        }
    ],
    "forms": [
        {
            "id": "party-form",
            "kind": "generated",
            "path": "manualtestparty01",
            "skjemanummer": "MANUALTEST-PARTY-01",
            "title": "Manuell test - avsender og bruker",
            "artifact": "forms/party-resolution.json",
            "notes": "Skjemanummer MANUALTEST-PARTY-01 gir lagret sti manualtestparty01. Bekreft sidene og rekkefølgen i den importerte versjonen."
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
                "note": "Kildene viser ikke rekkefølgen på dette skjemaets paneler etter introduksjonen. Testeren skal notere sidene som vises.",
                "evidence": ["Eksempel: ingen matchende kilde for panelrekkefølgen i denne skjemarevisjonen."]
            },
            "prerequisites": ["Ha legitimasjonsfil og to ulike testidentiteter klare."],
            "steps": [
                {
                    "action": "Velg «Send digitalt uten å logge inn».",
                    "expected": "Noter om «Legitimasjon» vises."
                },
                {
                    "action": "Velg legitimasjonstype, last opp legitimasjonsfilen og gå videre.",
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
                    "action": "Send inn søknaden. Last ned PDF-en fra kvitteringen og åpne den.",
                    "expected": "Noter kvitteringen og hvor avsender og bruker vises i PDF-en. PDF-en viser dokumentinnhold, men bekrefter ikke alene rollene registrert hos mottakeren."
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

- `collaboration.withNonDevelopers` records the caller's answer. `true` produces
  local HTML for manual PDF printing. `false` produces a GitHub issue document.
- Use `scope.included` and `scope.excluded` to separate implemented PR behavior
  from criteria that remain for later work. The renderer shows both to testers.
- `scope.notCoveredByTests` lists in-scope behavior or edge cases without a
  manual case, each with a concrete `area` and `reason`. Use an empty array
  when nothing is omitted. Do not use `scope.excluded` for test coverage gaps.
- `source.commitSha` must be the exact 40-character commit under test.
- `source.type` must be `pull-request`. `source.number` and `source.url` must
  identify the implementation pull request, even when the skill started from an
  issue.
- Include `source.issue` when the pull request implements an issue, whichever
  one the skill started from. Omit it when no issue is linked.
- `environment.name` is `preprod` or `preprod-alt`, selected from the PR's
  deployment and live revision check, not the workflow default. If uncertain,
  ask the user before finalizing the plan. `environment.internBaseUrl` and
  `environment.ansattBaseUrl` must identify the matching FyllUt ingresses
  (or Bygger ingresses for a Bygger-specific plan). The renderer appends
  the stored form path.
- `environment.revisionCheck` must identify the config endpoint and response
  field that expose the deployed application revision. For Bygger changes,
  resolve the missing revision method as described in the analysis workflow
  (loaded in workflow step 1) before generating a plan.
- `behaviorAnalysis` must contain the behavior matrix used to derive the test
  plan. Behavior IDs must be unique.
- Aligned and suspected-defect behaviors require high confidence because their
  intended result is confirmed. Open questions use medium or low confidence.
- `integrations` contains every outbound integration affected by the change.
  Integration IDs must be unique. Each integration
  references covered behaviors and has concrete evidence instructions.
  Use `evidence.options` for alternative methods. Each option has a unique
  lowercase `id`, `audience`, `method`, `owner`, `instructions` (ordered
  steps), and `expected` (the specific observable result).
  `repositoryReferences` and a URL are optional. For a submission,
  provide separate `team-logs` and `joark` options as described in the
  integration-evidence rules (loaded in workflow step 7). For collaboration with
  non-developers, also provide `handoff`. The renderer omits handoff from a
  non-collaborative GitHub issue even if it is present in the plan. A handoff
  must say the downstream check is pending, not passed.
- Every integration must be linked from at least one test case. If no approved
  evidence method exists, resolve that question before creating verification
  cases.
- `setupActions` contains structured setup. Every action has steps, an
  expected result, verification, and cleanup.
- A `forms-api-import` setup action must reference a form and include a
  shared-state warning and cleanup. For `MANUALTEST-` forms, the skill
  performs confirmed CREATE or explicitly approved UPDATE; the caller
  imports production forms through Bygger. The skill never deletes forms, so cleanup states
  a retention or approved restore decision.
- Case IDs must be unique.
- Every case must reference one or more entries in `behaviorAnalysis`.
- Render those references as visible links to the corresponding background
  points, not only inside the collapsed journey details.
- `integrationIds` references the outbound integrations exercised by the case.
- `risks`, and the case fields `prerequisites`, `testUsers`, `evidence`, and
  `cleanup`, may be omitted when empty. The renderer treats them as empty lists.
- A verification case may reference `aligned` or `suspected-defect` behaviors
  with high confidence, and its route must be source-mapped or observed
  in a browser. Its expected results
  must come from confirmed intent, an established contract, or unchanged
  baseline behavior. A suspected defect will usually make the case fail.
- An exploratory case can investigate a confirmed behavior, an open question,
  or an unmapped transition. It still needs precise steps and must not assert
  unsupported transitions. Describe what the tester should observe and record;
  trust the tester's judgment rather than inventing a pass criterion. Once the
  route and intended outcome are confirmed, update the expected results before
  changing the case to verification.
- `formId` must reference an entry in `forms`.
- Each form needs the actual `skjemanummer` and stored `path` from Forms API;
  the form-number link uses the stored path on the selected environment.
- A generated form intended for import must use the
  `MANUALTEST-` form-number prefix in its JSON artifact.
- Every case needs `journeyCheck` with a `status`. `verified` means this exact route was observed in a
  browser; `source-mapped` means its steps are grounded in the matching
  Cypress flows, implementation and exact form revision but have not
  been exercised in preprod. Neither is a claim that downstream payload
  values were checked. Add
  a Norwegian `route` naming the submission method and branch choices, and a
  Norwegian `note` describing what was mapped, seen, or remains unknown.
  `evidence` must name the PR head, exact preprod form revision, and
  file/line sources for each mapped transition or the recorded manual
  browser observation for an observed route. It must be nonempty for `verified`
  and `source-mapped`. For generated
  forms, check the exact JSON before import and the imported revision before
  sharing. Two cases using one form may have different route statuses.
  Metadata, schema checks, a similar form's Cypress test, and HTTP 200
  alone do not map or verify a route. Compare all rendered HTML or
  issue steps with that case's source map or trace.
- The exploratory case above illustrates an unresolved route. A source-mapped
  verification case uses `"mode": "verification"` and
  `"journeyCheck": {"status": "source-mapped", ...}` with the actual form
  revision and matching source locations in `evidence`. Its first step
  checks that the entry page and branch match the mapped route in preprod.
- Use arrays of short strings for prerequisites, test users, evidence, and
  cleanup.
- Omit generic test-user instructions. Use `testUsers` only for cases that need
  a user with specific attributes, and describe those attributes as part of the
  case setup.
- Each step has one action. Give it an observable expected result only when
  the case tests that result.
- Keep all actions needed to follow the journey, but include `expected` only
  where the case tests an outcome. A verification case needs at least one.
  Navigation alone does not need a separate assessment. Keep sentences short.
  The plan states the synthetic-data reminder once at the top, not per case.
- For submissions, handle the receipt PDF as described in the analysis
  workflow (loaded in workflow step 1).
- Put a shell command in the optional `steps[].command` field, not in prose
  or `evidence`. The renderer uses a code block in the HTML or issue.
  Put necessary deletion of local files or state in `cleanup`, not `evidence`.
- `setupActions` must not contain application deployment instructions.
- Do not include secrets or real personal data. The team may share approved
  synthetic identity numbers in its test notes to identify a submission;
  public artifacts contain instructions, not filled-in identity numbers.
- Follow the Language rules in `SKILL.md`. The canonical JSON contains both
  audiences, so fields used by the public outputs remain in Norwegian and
  `internal` fields are in English.
