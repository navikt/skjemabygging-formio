# Canonical test plan model

Use schema version `1`. Store the canonical JSON in the session artifact
directory. The renderer validates required fields before producing other
formats.

```json
{
    "schemaVersion": 1,
    "slug": "pr-2210-party-resolution",
    "title": "Manual test plan: shared party resolution",
    "summary": "Verify sender and concerned-user mapping.",
    "source": {
        "repository": "navikt/skjemabygging-formio",
        "type": "pull-request",
        "number": 2210,
        "url": "https://github.com/navikt/skjemabygging-formio/pull/2210",
        "ref": "feature/shared-party-resolution",
        "commitSha": "0123456789abcdef0123456789abcdef01234567"
    },
    "environment": {
        "name": "preprod-alt",
        "baseUrl": "https://fyllut-preprod-alt.intern.dev.nav.no/fyllut",
        "revisionCheck": {
            "endpoint": "https://fyllut-preprod-alt.intern.dev.nav.no/fyllut/api/config",
            "field": "gitVersion"
        }
    },
    "risks": ["Incorrect concerned user on a submitted application"],
    "behaviorAnalysis": [
        {
            "id": "B-01",
            "behavior": "Resolve the concerned user independently from the sender.",
            "before": "Representative submissions can assign the sender as the concerned user.",
            "intended": "The issue requires independent sender and concerned-user mapping.",
            "implemented": "The shared resolver maps the two parties independently.",
            "evidence": ["Issue #2201 acceptance criterion 2", "packages/shared-domain/src/party/resolver.ts"],
            "confidence": "high",
            "status": "aligned"
        }
    ],
    "setup": [
        {
            "title": "Import the generated form",
            "steps": ["Import forms/party-resolution.json after confirmation."],
            "expected": "Forms API returns the path testpartyresolution001."
        }
    ],
    "forms": [
        {
            "id": "party-form",
            "kind": "generated",
            "path": "testpartyresolution001",
            "title": "Manual test - party resolution",
            "artifact": "forms/party-resolution.json",
            "notes": "Shared by preprod and preprod-alt."
        }
    ],
    "testCases": [
        {
            "id": "TC-01",
            "group": "Digital submission",
            "title": "Person representative for identified user",
            "mode": "verification",
            "behaviorIds": ["B-01"],
            "priority": "P0",
            "purpose": "Verify bruker and avsender are mapped independently.",
            "formId": "party-form",
            "prerequisites": ["The generated form is imported."],
            "testData": ["Use approved synthetic identities."],
            "steps": [
                {
                    "action": "Complete the identified-user scenario.",
                    "expected": "The summary shows the concerned user and representative."
                },
                {
                    "action": "Submit the application.",
                    "expected": "The receipt is shown and the outbound application contains the concerned user as bruker."
                }
            ],
            "evidence": ["Record the submission ID.", "Capture the relevant non-sensitive result."],
            "cleanup": []
        }
    ]
}
```

## Field rules

- `slug` must contain lowercase letters, numbers, and hyphens only.
- `source.commitSha` must be the exact 40-character commit under test.
- `source.type` must be `pull-request`. `source.number` and `source.url` must
  identify the implementation pull request, even when the skill started from an
  issue.
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
- Use arrays of short strings for prerequisites, test data, evidence, and
  cleanup.
- Each step has one action and one observable expected result.
- `setup` must not contain application deployment instructions.
- Do not include secrets or real personal data.
