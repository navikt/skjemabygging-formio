# Norwegian-to-English terminology

Use this dictionary when naming variables, types, functions, routes, and other concepts in new code. Prefer the
listed English term unless an external API, an established product name, or a user-facing translation requires the
Norwegian term.

Choose names based on the role a concept has in the specific context. For example, `bruker` is usually `user`, but
the person submitting an application is an `applicant`.

| Norwegian | Preferred English | Guidance |
| --- | --- | --- |
| arbeidsgiver | employer | |
| behandling | processing | Use `case processing` when specifically referring to processing a case. |
| bruker | user | Use `applicant` when the person is applying for something. |
| digital innsending | digital submission | |
| egenerklæring | self-declaration | |
| enhet | Nav unit | Prefer `navUnit` in code. Use plain `unit` only outside the Nav organizational context. |
| ettersende | submit later | Use `provide later` when referring to documentation rather than the submission itself. |
| ettersending | subsequent submission | A separate submission that adds documentation to an earlier application. |
| ettersendelsesfrist | subsequent submission deadline | |
| fagterm | domain term | |
| folkeregistrert adresse | registered address | |
| fødselsnummer | national identity number | Prefer `nationalIdentityNumber` in code. Use the broader `identityNumber` when the value may also be a D-number. Use `pid` only for authentication claims or where required by an external API. |
| førsteside | cover page | |
| fullmakt | authorization | Use `power of attorney` when referring to the legal document or legal relationship. |
| innlogging | sign-in | Use `authentication` for the technical process or security mechanism. |
| innlogget bruker | signed-in user | |
| innsender | submitter | The submitter may be the applicant or someone acting on the applicant's behalf. |
| innsending | submission | |
| innsendings-ID | submission ID | Prefer `submissionId` in code. |
| mellomlagre | save draft | |
| mellomlagring | draft persistence | Use `draft storage` when specifically referring to the storage mechanism. |
| opplysning | information | Use a more precise name such as `address`, `answer`, or `income` when possible. |
| sak | case | |
| saksbehandler | caseworker | |
| skjema | form | |
| skjemabygger | form builder | Keep `Bygger` when referring to the product. |
| skjemadata | form definition | Use `formData` only when it cannot be confused with the browser's `FormData` type. |
| skjemanummer | form number | Prefer `formNumber` in code. |
| svar | answer | Use `answers` for the collection of values entered in a form. |
| søker | applicant | |
| søknad | application | |
| søknadsdata | application data | Use `submissionData` for data prepared for submission and `answers` when referring only to values entered in the form. |
| tema | archive subject | Prefer `archiveSubject` in code. Keep external subject codes and API field names unchanged. Do not use `theme`, which refers to visual styling. |
| utkast | draft | |
| utfylle | complete | For example, `completeForm`. |
| utfylling | form completion | Use `form filling` only when describing the user activity informally. |
| utfylt skjema | completed form | |
| vedlegg | attachment | |
| vedleggs-ID | attachment ID | Prefer `attachmentId` in code. |
| vilkår | condition | Use `eligibility criteria` when referring to requirements for receiving a benefit. |
| ytelse | benefit | |

## Naming examples

| Avoid in new code | Prefer |
| --- | --- |
| `soknad` | `application` |
| `brukerId` | `userId` or `applicantId`, depending on the role |
| `innsendingsId` | `submissionId` |
| `skjemanummer` | `formNumber` |
| `tema` | `archiveSubject` |
| `enhet` | `navUnit` |
| `mellomlagretSoknad` | `applicationDraft` |
| `ettersendelsesfrist` | `subsequentSubmissionDeadline` |

Do not rename fields belonging to external APIs solely to follow this dictionary. Map them to the preferred English
terms at the integration boundary when that improves the internal domain model.
