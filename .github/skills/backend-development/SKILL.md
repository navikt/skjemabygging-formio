---
name: backend-development
description: >-
    Mandatory repository guidance for every backend change or review. Always use
    for server code, API routes, middleware, services, external clients,
    authentication, configuration, logging, metrics, and backend tests.
---

# Backend development

Use this skill before investigating, planning, editing, or reviewing backend
behavior. Its rules are repository defaults, not questions for the user.

This applies to `shared-backend`, `fyllut-backend`, `bygger-backend`,
`form-spec-api`, other server packages, and shared-domain contracts changed for
backend behavior. A `.ts` extension alone does not make browser code backend
work.

## Package direction

- Put shared backend utilities and every new outbound API integration in
  `packages/shared-backend`, even when one application uses it initially.
- Existing application-local API clients are legacy. When replacing one, move
  its client and reusable service behavior to `shared-backend` instead of
  creating another local path.
- Keep application setup, routes, and composition in the application backend.
- Put contracts shared by frontend and backend in `packages/shared-domain`.
- Dependencies may point from application packages to shared packages, never
  the reverse.

## Outbound API pattern

Place an integration under `packages/shared-backend/src/services/<area>`.

### Client

- Keep the client generic and limited to transport: paths, methods, headers,
  serialization, and response parsing.
- Use the shared `http` helper so correlation IDs, serialization, response
  parsing, and `ResponseError` mapping remain consistent.
- Keep it package-private. Do not export it from the services barrel or package
  root, and do not import it from an application package.

### Service

- Make the service the public, opinionated boundary. It may validate and map
  data, apply domain rules and fallbacks, record metrics, and compose private
  clients.
- Export `create<Area>Service` and its `<Area>Service` type from the services
  barrel. Do not expose the client type.
- Pass stable configuration and dependencies to the factory. Pass tokens,
  identifiers, and payloads to service methods.
- Default to the internal client, with narrow dependency injection for isolated
  service tests.

### Initialization

- Initialize services once in the consuming application's composition root,
  normally `src/services/index.ts`.
- Read application configuration there and pass explicit values to the factory.
  Shared clients and services must not read application environment variables.
- Export initialized instances to routes and application services. Do not
  construct the same configured service in individual handlers.

## HTTP boundaries

- Keep authentication, request parsing, input validation, status codes,
  headers, and response mapping in routes or middleware.
- Validate untrusted input on the server; frontend validation is not sufficient.
- Put orchestration and business behavior in services, not Express handlers.
- Preserve existing API contracts unless compatibility and migration are part
  of the change. Keep endpoint-specific contracts in the specification, API
  documentation, and tests.

## Errors

- Use `ResponseError` from `shared-domain` for expected failures.
- Choose a semantic `ErrorCode`; let the shared error handler map it to the HTTP
  status and standard `ErrorResponse`.
- `message` is an English diagnostic included in the response, so it must be
  safe to expose. Use `userMessage` for intentional end-user wording and
  `correlationId` for an upstream correlation ID.
- Use the centralized error middleware from `shared-backend`. Clients and
  services must not send Express responses or define route response details.
- Let unexpected errors reach centralized handling. Do not expose stack traces,
  tokens, personal data, or upstream response bodies.
- Do not add new local `HttpError`, `ApiError`, numeric-status errors, or custom
  response shapes. These are legacy; migrate touched flows to `ResponseError`
  when the public contract can be preserved.

## Security and observability

- Enforce authentication and authorization at the protected server boundary.
  Do not trust client-provided identities, roles, or permissions.
- Use the structured backend logger and preserve correlation IDs across
  requests, outbound calls, logs, and error responses.
- Do not log form answers, personal data, credentials, tokens, cookies, or full
  authorization headers.
- Reuse existing metrics when extending the same behavior.

Consult:

- `auth-agent` for Azure AD, TokenX, ID-porten, Maskinporten, JWT validation,
  identities, and token exchange;
- `nais-agent` for Nais, GCP, deployment, and platform configuration;
- `observability-agent` for metrics, tracing, Grafana, and alerts;
- `security-champion-agent` for threat modelling, security architecture,
  compliance, and privacy.

Use the dedicated security-review workflow when asked to find exploitable
vulnerabilities.

## Testing

- Use Vitest for isolated backend, service, mapper, validator, and domain logic.
- Test external clients at their boundary, including request and response
  mapping and representative dependency failures.
- Use `request-body-verification` when a Cypress journey must prove the payload
  sent from a backend to an external service.
- Use Cypress only when browser-to-backend behavior is part of the outcome.

## Asking and exceptions

Check this skill, nearby code and tests, current contracts, and specialist
guidance before asking the user. Ask only about product behavior,
endpoint-specific contracts, meaningful trade-offs, or deliberate exceptions.

For an exception, explain the default, confirm the intended change, record its
compatibility effect, and add tests that distinguish it from the default.

## Maintaining this skill

Add a rule only when it is approved, cross-cutting, stable, and supported by
repository evidence. Do not add endpoint-specific, feature-specific, or
temporary decisions. Show the exact wording and require explicit approval.
