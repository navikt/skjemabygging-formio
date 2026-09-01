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
