# Builder reports

Reports are admin-only CSV downloads from `/api/reports/:reportId`.
The builder owns report formatting; forms-api remains the source of form data.
This implementation changes only skjemabygging-formio.

## Stage 1

Existing report IDs, columns and values are retained. New columns are appended.

| Report                      | Content                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `all-forms-summary`         | Existing key information, plus declaration type and custom text, subsequent-submission deadline, recipient address, paper unit selection, general-instructions presence, intro-page status, nologin links and PDF information. |
| `forms-published-languages` | Existing form/language information, plus separate published Bokmal, Nynorsk and English titles. One row per form; unpublished languages have blank title cells.                                                                |
| `all-forms-and-attachments` | One row per attachment, with form number/title and attachment title/code/label.                                                                                                                                                |
| `unpublished-forms`         | Existing unpublished-form information.                                                                                                                                                                                         |

The summary includes forms without uploaded PDFs. Actual PDF presence and
`STATIC_PDF` being enabled are separate facts: enabling the submission type does
not prove that a PDF has been uploaded. Failed data lookups must not be reported
as absent data.

Custom declaration text is exported only for custom declarations. The report
contains form configuration, not submitted applications or user answers.

Published-language title columns use the published snapshot's title as the
translation key, not a renamed pending draft. The existing main-title column
is preserved. Published languages with a missing title translation use the
same original-title fallback as the translation helper.

### First-publication date is deliberately unavailable

The first-publication date column is blank in stage 1. The reports page explains
this limitation. It is not populated from last-publication date, form creation
date or the first GitHub commit, and there is no nonfunctional date editor.

This is a visible outstanding requirement, not a completed date feature.

## Data volume and download behavior

CSV output should be consumed as a stream, including completion, backpressure,
errors and cancellation. Form detail requests remain bounded; reference data
such as recipients is fetched once per report rather than once per form.

Current forms-api list endpoints still return the complete compact form list.
They omit components, so attachment processing requires detail requests. Local
refactoring does not remove this list's memory cost or make API requests
paginated. Additional PDF metadata lookups also contribute to report latency.
Do not describe stage 1 as constant-memory or as eliminating N+1 requests.

For N non-test forms, the summary makes `2 + 2N` service calls: one compact list,
one recipient list, and one form/detail plus one PDF metadata request per form.
Language reporting makes `1 + 2N` calls to get the compact list, published
snapshots and translations. The attachment report makes `1 + N` calls.
PDF requests use the existing `/v1/forms/:path/static-pdfs` metadata endpoint;
no PDF binaries are downloaded.

Cancellation stops waiting and prevents further lookups. Existing clients
cannot abort a request already sent to forms-api, so that request can finish
after the download has been cancelled.

## Backend handoff / stage 2

These are separate backend-team discussions, not permission to edit sibling
repositories:

| Topic                  | Required agreement                                                                                                                                               | Frontend follow-up                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| First-publication date | Authoritative read/write contract, date semantics, permissions, first-publication behavior and provenance of historical corrections.                             | Shared types, API integration, builder display/editing and real values in the existing CSV date column. |
| Historical dates       | Determine which historical values are reliable and who approves backfill. The inspected Formio import stored the latest publication state, not complete history. | Keep unknown values blank and explain incomplete historical coverage.                                   |
| Pagination/batch       | Assess bounded list/detail or report-data access based on measured load; retain existing contracts for existing clients.                                         | Process pages/batches without changing report format.                                                   |

Pagination is not a prerequisite for stage 1 or for integrating the date field.
Do not automatically assign today's date to an old form just because its
first-publication metadata is missing when it is republished.

## Demonstrating the delivery

Use non-sensitive forms covering standard/custom declarations and recipients,
enabled/disabled intro pages, supported nologin submission, uploaded/no PDFs,
and published/unpublished languages. Download the real reports and confirm that
the first-publication column is blank with the corresponding explanation on the
reports page.

For performance comparison, record dataset size, report row count, upstream
requests, elapsed time and process memory under a normal and a slow consumer.
Synthetic in-process measurements are useful regression evidence, not production
capacity estimates. Production-sized timing depends on upstream response sizes
and latency as well as the report pipeline.

### Stage-one evidence

The synthetic streaming test uses 300 non-sensitive forms, 60 components per
detail response, custom declarations, sequential requests with simulated 1ms
latency, and a sink that discards output after parsing. Both normal and delayed
sinks produce 300 rows / 820,770 bytes from 602 service calls. In one run:

| Sink          | First byte | Total   | Sampled V8 heap baseline / peak |
| ------------- | ---------- | ------- | ------------------------------- |
| Normal        | 3ms        | 751ms   | 70.7 / 102.0 MB                 |
| 5ms per write | 3ms        | 1,617ms | 104.0 / 114.7 MB                |

The compact input is 851,561 serialized bytes. These are process heap samples
inside a test worker, not isolated report allocations, RSS or capacity limits.
The different baselines reflect worker/GC state, not an optimized slow-sink
memory result.

Focused service, route and stream coverage includes 52 passing tests. The local
runner could not report RSS (`EACCES`); a temporary, test-process-only fallback
reported actual V8 heap statistics and unavailable RSS as `NaN`. It was removed
after execution; application code does not contain this workaround.

Builder UI type-check and targeted lint passed. The added Cypress spec covers
the date explanation, report-list failure and non-admin visibility, but could
not run in this environment: the dev launcher failed readiness and Cypress
verification failed reading `/proc/cpuinfo`. Browser validation remains to be
run in a supported development environment using the repository's standard
`pnpm start:bygger:mocks` flow and `cypress/e2e/reports.spec.cy.ts`.
