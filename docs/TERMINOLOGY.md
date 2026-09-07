# Norwegian-to-English terminology

Use this dictionary when naming variables, types, functions, routes, and other concepts in new code. It covers
concepts used in this repository where a Norwegian term or several possible English translations could otherwise
result in inconsistent naming.

Prefer the listed English term unless an external API, an established product name, or a user-facing translation
requires the Norwegian term.

Choose names based on the role a concept has in the specific context. For example, `bruker` is usually `user`, but
the person submitting an application is an `applicant`.

| Norwegian           | Preferred English              | Guidance                                                                                                                                                                                        |
| ------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| arbeidsgiver        | employer                       |                                                                                                                                                                                                 |
| avsender            | sender                         | The sender may be the applicant or someone acting on the applicant's behalf.                                                                                                                    |
| bruker              | user                           | Use `applicant` when the person is applying for something.                                                                                                                                      |
| digital innsending  | digital submission             |                                                                                                                                                                                                 |
| egenerklæring       | self-declaration               |                                                                                                                                                                                                 |
| enhet               | Nav unit                       | Prefer `navUnit` in code. Use plain `unit` only outside the Nav organizational context.                                                                                                         |
| ettersending        | subsequent submission          | A separate submission that adds documentation to an earlier application.                                                                                                                        |
| ettersendelsesfrist | subsequent submission deadline |                                                                                                                                                                                                 |
| fødselsnummer       | national identity number       | Prefer `nationalIdentityNumber` in code. Use the broader `identityNumber` when the value may also be a D-number. Use `pid` only for authentication claims or where required by an external API. |
| førsteside          | cover page                     |                                                                                                                                                                                                 |
| innlogging          | sign-in                        | Use `authentication` for the technical process or security mechanism.                                                                                                                           |
| innsending          | submission                     |                                                                                                                                                                                                 |
| innsendings-ID      | submission ID                  | Prefer `submissionId` internally. Keep `innsendingsId` when it is a field or identifier from the SendInn API.                                                                                   |
| innsendingsmåte     | submission method              | For example, digital or paper submission.                                                                                                                                                       |
| løspost             | standalone submission          | Keep `LOESPOST` when required by an external API.                                                                                                                                               |
| mellomlagre         | save draft                     |                                                                                                                                                                                                 |
| mellomlagring       | draft                          | Use `draft saving` for the action or functionality.                                                                                                                                             |
| mottaker            | recipient                      |                                                                                                                                                                                                 |
| mottaksadresse      | recipient address              | Prefer `recipientAddress` in code.                                                                                                                                                              |
| organisasjonsnummer | organization number            | Prefer `organizationNumber` in code.                                                                                                                                                            |
| papirinnsending     | paper submission               |                                                                                                                                                                                                 |
| preutfylling        | prefill                        | Use `prefill` as a noun or verb in code.                                                                                                                                                        |
| skjema              | form                           |                                                                                                                                                                                                 |
| skjemabygger        | form builder                   | Keep `Bygger` when referring to the product.                                                                                                                                                    |
| skjemadefinisjon    | form definition                | The form structure, components, and configuration. Avoid `formData`, which can be confused with submitted values or the browser's `FormData` type.                                              |
| skjemanummer        | form number                    | Prefer `formNumber` in code.                                                                                                                                                                    |
| svar                | answer                         | Use `answers` for the collection of values entered in a form.                                                                                                                                   |
| søker               | applicant                      |                                                                                                                                                                                                 |
| søknad              | application                    |                                                                                                                                                                                                 |
| tema                | archive subject                | Prefer `archiveSubject` in code. Keep external subject codes and API field names unchanged. Do not use `theme`, which refers to visual styling.                                                 |
| utkast              | form draft                     | Use this for an unpublished form in Bygger. Use `draft` for a saved application in Fyllut.                                                                                                      |
| utfylle             | fill in                        | For example, `fillInForm`. Use `complete` when specifically referring to finishing the form.                                                                                                    |
| utfylling           | form filling                   |                                                                                                                                                                                                 |
| vedlegg             | attachment                     |                                                                                                                                                                                                 |
| vedleggs-ID         | attachment ID                  | Prefer `attachmentId` in code.                                                                                                                                                                  |

## Naming examples

| Avoid in new code     | Prefer                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| `soknad`              | `application`                                                              |
| `avsender`            | `sender`                                                                   |
| `brukerId`            | `userId` or `applicantId`, depending on the role                           |
| `innsendingsId`       | `applicationId`, except at the SendInn API boundary                        |
| `mellomlagring`       | `draft` or `draftSaving`, depending on the context                         |
| `mottaksadresse`      | `recipientAddress`                                                         |
| `preutfylling`        | `prefill`                                                                  |
| `skjemadata`          | `formDefinition` or `submissionData`, depending on what the value contains |
| `skjemanummer`        | `formNumber`                                                               |
| `tema`                | `archiveSubject`                                                           |
| `enhet`               | `navUnit`                                                                  |
| `ettersendelsesfrist` | `subsequentSubmissionDeadline`                                             |

## Integration boundaries

Do not rename fields belonging to external APIs solely to follow this dictionary. This includes fields such as
`innsendingsId`, `ettersendingsId`, `tema`, and other SendInn domain fields. Map them to the preferred English terms
at the integration boundary when that improves the internal domain model.
