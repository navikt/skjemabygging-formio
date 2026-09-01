---
name: fyllut-deploy-topology
description: >-
    How FyllUt is built and deployed across two repositories, and why GIT_SHA
    means different things depending on which repository built the image. Use
    this when adding a NAIS environment variable, changing deploy workflows, or
    interpreting a commit hash shown by the application.
---

# FyllUt deploy topology

## Goal

Understand which repository contributes what to a running FyllUt instance,
before changing deploy configuration or reasoning about version identifiers.

## Two repositories, one application

FyllUt is assembled from two repositories:

- **this monorepo** builds the `fyllut-base` image containing the application
  code, and owns the NAIS configuration under `.nais/fyllut/`
- **`skjemautfylling-formio`** holds published form definitions, translations
  and resources, and builds the production image `FROM` `fyllut-base`

Production deploys are therefore **driven from `skjemautfylling-formio`**, not
from here — and so are `dev` and `delingslenke`. That repository pins the
monorepo commit it builds on in a file, and during deploy it fetches
`.nais/fyllut/config.yaml` and the environment's variable file from this
repository **at that pinned commit**.

`preprod` and `preprod-alt` are the exception: they are deployed from this
repository's manual deploy workflow and run `fyllut-base` directly, with NAIS
configuration read straight from the working tree.

Two consequences worth knowing:

- for environments deployed from `skjemautfylling-formio`, application code and
  NAIS configuration always ship together, so a new environment variable and the
  code reading it deploy as one unit — no ordering constraint between the
  repositories
- editing `.nais/fyllut/*.yaml` here reaches `preprod`/`preprod-alt`
  immediately, but does not reach `prod`, `dev` or `delingslenke` until
  `skjemautfylling-formio` publishes and pins a monorepo commit containing it

## `GIT_SHA` means different things per environment

The base image sets **both** `GIT_SHA` and `MONOREPO_GIT_SHA` to the monorepo
commit. Images built in `skjemautfylling-formio` then **override `GIT_SHA`**
with that repository's own commit.

| Environment             | Image built in           | `GIT_SHA`                                       | `MONOREPO_GIT_SHA`      |
| ----------------------- | ------------------------ | ----------------------------------------------- | ----------------------- |
| prod, dev, delingslenke | `skjemautfylling-formio` | content commit — forms, translations, resources | application code commit |
| preprod, preprod-alt    | this monorepo            | application code commit                         | application code commit |

So `GIT_SHA` answers "which application build" in some environments and "which
content snapshot" in others — same name, different meaning. When you need the
application code version unambiguously, use `MONOREPO_GIT_SHA`.

Because the content commit changes whenever _any_ form is published, it cannot
tell you whether one particular form changed.

## Adding a NAIS environment variable

- [ ] Declared in the shared `.nais/fyllut/config.yaml` template
- [ ] Set explicitly in **every** environment variable file, including
      production — do not rely on an implicit default to distinguish
      environments
- [ ] Given a safe fallback in backend configuration, so an unset value fails
      obviously rather than looking like production
- [ ] Remember `prod`, `dev` and `delingslenke` pick the change up only once
      `skjemautfylling-formio` pins a monorepo commit containing it, while
      `preprod`/`preprod-alt` get it straight away
