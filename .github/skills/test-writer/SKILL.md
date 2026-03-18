---
name: test-writer
description: >-
    Write and place tests in skjemabygging-formio. Covers the correct framework,
    file location, and patterns for unit tests (Vitest), React component tests
    (@testing-library/react), backend integration tests (supertest), HTTP mocking
    (nock), E2E tests (Cypress), and accessibility checks (cypress-axe).
---

# Test writer

Guidelines for writing tests in `skjemabygging-formio`.

## Framework selection

| Context                              | Framework              | Notes                                                                       |
| ------------------------------------ | ---------------------- | --------------------------------------------------------------------------- |
| Unit & integration (all packages)    | **Vitest**             | `yarn test` / `yarn test:coverage`                                          |
| UI behaviour & component interaction | **Cypress**            | `packages/bygger/` and `packages/fyllut/` — preferred over @testing-library |
| Express endpoints                    | **supertest** + Vitest | Real HTTP requests against the app                                          |
| HTTP mocking (outbound)              | **nock**               | Intercept and assert outbound calls                                         |
| Accessibility                        | **cypress-axe**        | Axe checks inside Cypress tests                                             |

> **Note on @testing-library/react:** Existing tests using `@testing-library/react` are considered legacy and should be replaced with Cypress tests when touched. Do not write new `@testing-library/react` tests.

## File placement

| Package                      | Unit/integration tests                                       | E2E tests                |
| ---------------------------- | ------------------------------------------------------------ | ------------------------ |
| `packages/shared-domain`     | Next to source: `src/**/*.test.ts`                           | —                        |
| `packages/shared-backend`    | Next to source: `src/**/*.test.ts`                           | —                        |
| `packages/shared-frontend`   | Next to source: `src/**/*.test.tsx`                          | —                        |
| `packages/shared-components` | Next to source: `src/**/*.test.tsx` (legacy — do not expand) | —                        |
| `packages/bygger`            | Next to source: `src/**/*.test.tsx`                          | `cypress/e2e/**/*.cy.ts` |
| `packages/bygger-backend`    | Next to source: `src/**/*.test.ts`                           | —                        |
| `packages/fyllut`            | Next to source: `src/**/*.test.tsx`                          | `cypress/e2e/**/*.cy.ts` |
| `packages/fyllut-backend`    | Next to source: `src/**/*.test.ts`                           | —                        |

## Running tests

```bash
# All unit tests (all packages)
yarn test

# Unit tests with coverage
yarn test:coverage

# Watch mode (single package)
cd packages/<package> && yarn test --watch

# Cypress — see the cypress-repo-workflow skill for full setup
```

## Vitest unit test — minimal example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
    it('returns expected value', () => {
        expect(myFunction('input')).toBe('expected');
    });
});
```

## Cypress E2E test — minimal example

See the **`cypress-repo-workflow`** skill for how to set up and run Cypress locally. A minimal spec looks like:

```typescript
describe('MyComponent', () => {
    it('shows label and responds to click', () => {
        cy.visit('/my-page');
        cy.findByRole('button', { name: 'Click me' }).click();
        cy.findByText('Done').should('exist');
    });
});
```

## Express endpoint test — minimal example

```typescript
import supertest from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../app';

describe('GET /api/resource', () => {
    it('returns 200 with data', async () => {
        const response = await supertest(app).get('/api/resource');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ id: expect.any(String) });
    });
});
```

## HTTP mocking with nock — minimal example

```typescript
import nock from 'nock';
import { describe, it, expect, afterEach } from 'vitest';
import { fetchExternalData } from './fetchExternalData';

afterEach(() => nock.cleanAll());

describe('fetchExternalData', () => {
    it('returns parsed data from external API', async () => {
        nock('https://api.example.com').get('/data').reply(200, { value: 42 });
        const result = await fetchExternalData();
        expect(result.value).toBe(42);
    });
});
```

## Related skills

| Skill                       | Use for                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `cypress-repo-workflow`     | Running and debugging Cypress tests locally and in CI           |
| `mock-forms-and-test-cases` | Creating mock forms and numbered test-case fixtures for Cypress |
