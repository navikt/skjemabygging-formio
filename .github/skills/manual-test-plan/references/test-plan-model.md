# Canonical test plan model

Use schema version `2`. Store the canonical JSON in the session artifact
directory. The renderer validates required fields before producing other
formats.

```json
{
    "schemaVersion": 2,
    "slug": "pr-2210-party-resolution",
    "title": "Manuell testplan: avsender og bruker",
    "summary": "Kontroller at avsender og bruker blir behandlet uavhengig av hverandre.",
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
            "behavior": "Avsender og bruker blir behandlet som to ulike personer.",
            "before": "Ved innsending på vegne av andre kan avsender bli registrert som bruker.",
            "intended": "Den som sender inn skal være avsender, mens personen søknaden gjelder skal være bruker.",
            "implemented": "Løsningen finner avsender og bruker uavhengig av hverandre.",
            "evidence": ["Issue #2201 acceptance criterion 2", "packages/shared-domain/src/party/resolver.ts"],
            "confidence": "high",
            "status": "aligned"
        }
    ],
    "setup": [
        {
            "title": "Gjør testskjemaet tilgjengelig",
            "steps": ["Importer testskjemaet etter at den som bestilte testplanen har godkjent det."],
            "expected": "Skjemaet er tilgjengelig i preprod og preprod-alt."
        }
    ],
    "forms": [
        {
            "id": "party-form",
            "kind": "generated",
            "path": "testpartyresolution001",
            "title": "Manuell test - avsender og bruker",
            "artifact": "forms/party-resolution.json",
            "notes": "Samme skjema brukes i preprod og preprod-alt."
        }
    ],
    "testCases": [
        {
            "id": "TC-01",
            "group": "Digital innsending",
            "title": "Send inn på vegne av en annen person",
            "mode": "verification",
            "behaviorIds": ["B-01"],
            "priority": "P0",
            "purpose": "Kontroller at personen søknaden gjelder vises som bruker, og at innsenderen vises som avsender.",
            "formId": "party-form",
            "prerequisites": ["Testskjemaet er tilgjengelig i miljøet."],
            "testUsers": [],
            "steps": [
                {
                    "action": "Fyll ut skjemaet på vegne av en annen person.",
                    "expected": "Oppsummeringen viser riktig bruker og avsender."
                },
                {
                    "action": "Send inn søknaden.",
                    "expected": "Kvitteringen vises, og søknaden er registrert på riktig bruker."
                }
            ],
            "evidence": ["Noter innsendings-ID og resultat uten personopplysninger."],
            "cleanup": []
        }
    ]
}
```

## Field rules

- `slug` must contain lowercase letters, numbers, and hyphens only.
- `collaboration.withNonDevelopers` records the caller's answer. `true` produces
  HTML and Slack Canvas. `false` produces a GitHub issue document.
- `source.commitSha` must be the exact 40-character commit under test.
- `source.type` must be `pull-request`. `source.number` and `source.url` must
  identify the implementation pull request, even when the skill started from an
  issue.
- Include `source.issue` when an issue exists. Omit it only when the caller
  confirms that the change has no issue.
- `environment.internBaseUrl` and `environment.ansattBaseUrl` must identify both
  FyllUt ingresses. The renderer appends the form path.
- `environment.revisionCheck` must identify the config endpoint and response
  field that expose the deployed application revision.
- `behaviorAnalysis` must contain the behavior matrix used to derive the test
  plan. Behavior IDs must be unique and match `B-<number>`.
- Behavior confidence is `high`, `medium`, or `low`. Aligned and suspected
  defects require high confidence because their intended result is confirmed.
  Open questions use medium or low confidence.
- Behavior status is `aligned`, `suspected-defect`, or `open-question`.
- Case IDs must be unique and match `TC-<number>`.
- Every case must reference one or more entries in `behaviorAnalysis`.
- Case mode is `verification` or `exploratory`.
- A verification case may reference `aligned` or `suspected-defect` behaviors
  with high confidence. Its expected results must come from confirmed intent,
  an established contract, or unchanged baseline behavior. A suspected defect
  will usually make the case fail, which is useful evidence.
- An exploratory case may reference only open questions. It records observations
  for unresolved behavior and must not claim that one outcome is correct.
- Priorities are `P0`, `P1`, `P2`, or `P3`.
- `formId` must reference an entry in `forms`.
- Use arrays of short strings for prerequisites, test users, evidence, and
  cleanup.
- Omit generic test-user instructions. Use `testUsers` only for cases that need
  a user with specific attributes, and describe those attributes as part of the
  case setup.
- Each step has one action and one observable expected result.
- `setup` must not contain application deployment instructions.
- Do not include secrets or real personal data.
- Write all tester-facing fields in Norwegian and use terminology from the
  application, forms, issue, and approved specification.
