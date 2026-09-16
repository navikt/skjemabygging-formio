# Builder reports

Reports are admin-only CSV downloads from `/api/reports/:reportId`.
The builder owns report formatting; forms-api remains the source of form data.
The four download links are available on `/rapporter`.

Files use semicolon-separated UTF-8 with a byte-order mark (BOM) for Excel.
Programmatic CSV consumers must handle the BOM so it does not become part of
the first column name.

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

CSV output is streamed with backpressure, completion and error handling.
Form detail requests are sequential; reference data
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

The backend team must agree on the following contracts before frontend integration:

| Topic                  | Required agreement                                                                                                                                               | Frontend follow-up                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| First-publication date | Authoritative read/write contract, date semantics, permissions, first-publication behavior and provenance of historical corrections.                             | Shared types, API integration, builder display/editing and real values in the existing CSV date column. |
| Historical dates       | Determine which historical values are reliable and who approves backfill. The inspected Formio import stored the latest publication state, not complete history. | Keep unknown values blank and explain incomplete historical coverage.                                   |
| Pagination/batch       | Assess bounded list/detail or report-data access based on measured load; retain existing contracts for existing clients.                                         | Process pages/batches without changing report format.                                                   |

Pagination is not a prerequisite for stage 1 or for integrating the date field.
Do not automatically assign today's date to an old form just because its
first-publication metadata is missing when it is republished.
