---
name: form-definition-loading
description: >-
    How form definitions reach fyllut-backend from static files or forms-api,
    and the traps that silently drop form fields. Use this when adding a field
    from forms-api, changing form loading, or relying on form metadata such as
    publicationId, revision or status.
---

# Form definition loading

## Goal

Add or consume a form field without silently losing it in one of the two
loading paths.

Every trap below fails **silently**: the field arrives as `undefined`, nothing
throws, and the missing data only shows up as subtly wrong output much later.

## Two loading paths

The paths below describe Fyllut. Sendinn uses the separate forms-api-only
service described under "Sendinn content source".

`fyllut-backend` resolves form definitions in one of two ways, decided by
`FORMS_SOURCE`:

| Source             | Used by                                   | Comes from                                                 |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| `static`           | prod, dev                                 | published JSON files bundled from `skjemautfylling-formio` |
| `formsapi-staging` | preprod, preprod-alt, delingslenke, local | forms-api, current revision (may be an unpublished draft)  |

The static path serves **published snapshots**. The forms-api path serves the
**latest revision**, which is often a draft ahead of what has been published.

## Trap 1: `FORMS_SOURCE` does not identify the environment

Both prod and dev use `static`. Never use the forms source as a proxy for "is
this production". Use explicit configuration instead.

## Trap 2: the static path maps through an explicit field whitelist

The backwards-compatibility mapper that converts stored form JSON into the
shared form model destructures a fixed list of fields and rebuilds the object.
Fields not in that list are dropped, even when they exist in the JSON on disk.

Adding a field from forms-api therefore takes **two** edits:

1. add it to the shared form model, and
2. add it to the backwards-compatibility mapper.

Do only the first and the forms-api path works while the static path silently
returns `undefined` — meaning it breaks in production and dev, and works
everywhere you are likely to test.

## Trap 3: `select` lists are per-call-site and drift apart

Callers pass an explicit `select` list of the fields they want. Fields left out
are simply absent from the response; there is no error. Several routes render
the same document but historically requested different fields.

When a feature spans more than one route, align the `select` lists across all
of them in the same change, and add a test that covers each route rather than
just one.

## Trap 4: `publicationId` is only trustworthy when `status` is `published`

forms-api returns the **latest publication's** `publicationId` even when the
current revision is a draft ahead of that publication (`status: pending`). The
id then describes different components than the ones you just loaded.

Guard every use:

```
const trustworthy = status === 'published' && publicationId;
```

Static snapshots are always `published`, so the guard is a no-op there and only
matters on the forms-api path — which is exactly where local and test
environments run.

Related background on what a publication covers lives in the forms-api
repository.

## Checklist for adding a forms-api field

- [ ] Field added to the shared form model
- [ ] Field added to the backwards-compatibility mapper used by the static path
- [ ] Field added to the `select` list of **every** call site that needs it
- [ ] Behaviour verified on both loading paths, not just the one running locally

## Sendinn content source

Sendinn uses `SENDINN_CONTENT_SOURCE`, not Fyllut's `FORMS_SOURCE`.
The value is required when `NODE_ENV=production`. In development and test it
defaults to `latest`. Empty or unknown values fail startup, and `prod-gcp`
also rejects `latest`.

| Value       | Form definition                | Form translations                           | Global translations                                |
| ----------- | ------------------------------ | ------------------------------------------- | -------------------------------------------------- |
| `published` | `/v1/form-publications/{path}` | `/v1/form-publications/{path}/translations` | `/v1/published-global-translations/{language}`     |
| `latest`    | `/v1/forms/{path}`             | `/v1/forms/{path}/translations`             | `/v1/global-translations?languageCodes={language}` |

The two sources return translations in different shapes. `latest` returns
translation rows (`[{ key, nb, nn, en }]`). Published form translations
return `{ publishedAt, publishedBy, translations: { [language]: { [key]: text } } }`,
with `translations: {}` when the language has no published translations.
Published global translations return a flat `{ [key]: text }` dictionary.
`loadFormTranslations` and `loadGlobalTranslations` in
`services/translation/translationLoader.ts` read both shapes for one or more
languages. They build one row per key across the requested languages and map
the rows with `convertToFormsApiTranslationMap`, so validation keys such as
`required` also get an entry under their Bokmål text and an `nb` fallback for
both sources. A published `nb` value wins over that fallback. `published`
requires explicit `languageCodes` and fetches global translations once per
language. A missing response returns `undefined`, so each service decides
how to handle it.

Both sources fetch the whole form without `select`. Sendinn never loads
static snapshots. `latest` returns the current revision, including pending
or unpublished edits, without filtering by status. A pending form's
`publicationId` still describes an older publication and must not identify
the current content.

Preprod, preprod-alt and the local mock launcher explicitly select `latest`.
The shared Nais template requires an environment-specific `content-source`.
There is no production Sendinn manifest yet. When #2283 adds it, select
`published` and add forms-api production inbound access in `navikt/forms-api`
before exposing the journey.

`published` caches successful form, form-translation and global-translation
responses in memory for five minutes per form path and language. Concurrent
requests share one fetch, and callers get a copy of the cached value. `latest`
has no cache, so edits show immediately. Failures are never cached, so the
next request retries, and unknown paths from user input do not grow the
cache. Each outbound request has a five-second timeout, including reading the
response body. There is no stale, static, cross-source or empty-success
fallback on failure. Requests are not revision-pinned: content can change
between a form request and a translation request, and a new publication can
take up to five minutes to appear.

`createContentService({ baseUrl, source })`, `isContentSource` and the
`ContentService` and `ContentSource` types are exported through
shared-backend's services barrel. The private clients have separate published
functions (`getPublishedForm`, `getPublishedFormTranslations`,
`getPublishedGlobalTranslations`) instead of a source parameter.
Sendinn initializes `contentService` once in `src/services/index.ts`.
Downstream form loading and document preparation use `getForm({ formPath })`
and `getTranslations({ formPath, languageCode })`. The service also exposes
`getFormTranslations({ formPath, languageCode })` and
`getGlobalTranslations(languageCode)`. Translation results use the existing
`FormsApiTranslationMap` shape; form translations override matching global
keys in `getTranslations`. Forms include resolved `languages`, using the
existing published/unpublished language rules.

The service rejects a form path that is not lowercase letters and digits with
`BAD_REQUEST` before calling forms-api. Upstream missing content remains
`NOT_FOUND`. Other HTTP dependency errors,
connection failures and timeouts become `SERVICE_UNAVAILABLE` with a safe
English message. Malformed form responses and missing translation responses
also fail explicitly.
Connection failures and timeouts are logged as warnings with the resource,
source and error name. The centralized handler returns the standard correlated
error. Upstream
correlation IDs are preserved for HTTP failures. No upstream body, author
metadata or answers are logged or included in the public diagnostic.

Existing Fyllut form/translation defaults are unchanged. When Fyllut loads
from forms-api (`FORMS_SOURCE=formsapi-staging` or mocks), `translationService`
uses the same loader with `latest`. A missing response still gives no
translations. Static-file loading is unchanged.

### Sendinn paper form loading

`GET /sendinn/api/forms/{formPath}?lang={nb|nn|en}&filter={code}`
loads a canonical paper form through the configured content service.
`lang` defaults to `nb`. Repeated `filter` values and comma-separated codes
use `normalizeAttachmentCodeFilter`; empty input means all attachments.
`sub` has no effect. Paper eligibility comes from the source form's
`properties.subsequentSubmissionTypes`, never from the converted form's
`submissionTypes`.

The response contains `form`, resolved `languages`, selected `language`,
merged `translations` and normalized `attachmentFilter`. The form retains
its source `publishedLanguages`. A requested language outside the resolved
list falls back to Bokmål without fetching that language's translations.
The response is not cached.

A missing form or disabled paper ettersending returns standard `NOT_FOUND`
(404). Dependency outages return correlated errors, not an empty form.
Missing translations for an otherwise available form are
`SERVICE_UNAVAILABLE` (503), not a missing-form result. An eligible form with
no filter matches remains a successful canonical form with an empty
`sendinnAttachments` panel.

The shared frontend's `createSendinnFormService({ baseUrl, http })` adapter
provides `loadForm(request)`. The form entry loads it before mounting the
journey. `useSendinnForm()` reads the loaded response from
`SendinnFormProvider`; it does not provide draft, upload or submission
capabilities. Document preparation must independently reload and reconvert
the trusted source with the same normalized filter.

### Sendinn paper cover page

`POST /sendinn/api/cover-page` accepts JSON with `formPath`, `revision`
(a positive integer), `language` (`nb`, `nn` or `en`, default `nb`),
`attachmentFilter` (a string or string array, default empty) and
`submission: { data: ... }`. Pass the canonical Submission answers, the
revision of the loaded form and the filter retained by `SendinnFormProvider`.
Do not pass a form definition, labels or a Party. Query parameter `sub`
does not select a submission mode.
`SendinnCoverPageRequest` and `SendinnCoverPageResult` are exported from
shared-domain for the T7 host adapter. Concerned-person answers are supplied
postal metadata, not proof of the caller's identity or resource ownership.

With the `published` content source the service first reads the cached
publication. An unpublished form gives 404. If the publication has the pinned
revision, the service uses it. Otherwise it loads
`GET /v1/forms/{path}?revision=N` and rejects a `status` other than
`published` as 404. forms-api computes that status per revision, so the
publication check is what stops older revisions of an unpublished form. With
`latest` the service always loads the pinned revision, without cache. It then
rechecks paper eligibility, language availability and normalized filter
membership. Translations are not pinned: only
`publicationId` pins them, and forms-api has no endpoint that fetches by it.
Preprod cleanup can delete old revisions, which also gives 404.

Success is `200 application/json` with `{ "pdf": "<base64 PDF>" }` and
`Cache-Control: no-store`. T7 decodes the PDF and owns the browser download;
this endpoint does not return form answers or download assembly data.
Expected errors use the central `ErrorResponse` and `x-correlation-id`:
invalid request fields, an unknown or forbidden `userType`, a missing Nav
unit or user identity, unavailable selections, empty available attachment
lists and values the generator cannot encode are 400; missing or
paper-disabled forms are 404; content, Nav-unit, token and generator
failures are 503. Diagnostics never contain answers or raw upstream bodies.
A nonempty available attachment list still permits zero selections until T9
adds the final minimum-selection rule.

Shared-backend exports `createSendinnCoverPageService` and
`createSubsequentSubmissionDownloadData`. The latter returns
`{ data: CoverPageDownloadType, unitTypes }`. `data.user` is absent when the
form hides user types, forces a Nav unit, or the user chose multiple people.
`unitTypes` comes from the active Nav unit field and filters Norg2 units.
Only active converted inputs reach party resolution and recipient mapping.
The assembly does not repeat field rules the renderer already enforces
(address shape, identity number checksum, attachment record shape). The
generator validates the identity number. `coverPageRequestBodyMapper` rejects
characters the generator cannot encode, also for attachment titles.
Selected Nav units use `enhetsnummer` with the mapper's existing
`netsPostboks: "1400"` routing, not a fabricated postal address.

Sendinn configures the existing cover-page service with
`SKJEMABYGGING_PROXY_URL`. It gets client-credentials tokens from Texas
through `createEntraIdTokenService`, with target
`api://<SKJEMABYGGING_PROXY_CLIENT_ID>/.default`. Local development outside
mocks can use `SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN`; mock runs never send it.
Preprod release also requires the proxy's inbound policy and Entra ID caller
authorization to accept both Sendinn applications. Those permissions live
outside this repo.
