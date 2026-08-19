---
name: backend-development
description: >-
  Mandatory repository guidance for every backend change or review. Always use
  for server-side TypeScript, API routes, middleware, services, external
  clients, authentication, backend configuration, logging, metrics, and
  backend tests in shared-backend, fyllut-backend, bygger-backend,
  form-spec-api, or another server package.
---

# Backend development

Use this skill before investigating, planning, editing, or reviewing backend
behavior. It contains repository defaults that are not user decisions. Do not
ask the user how to solve something already defined here.

## Scope

This skill applies to:

- `packages/shared-backend`, `packages/fyllut-backend`, and
  `packages/bygger-backend`;
- `packages/form-spec-api` and other server packages;
- server-side API routes, middleware, services, clients, and configuration;
- authentication, authorization, security controls, logging, metrics, and
  tracing in backend flows;
- backend and API tests;
- shared-domain contracts changed for backend behavior.

It does not apply to browser-facing TypeScript merely because the file
extension is `.ts`.

## Package direction

- Put shared backend utilities and all new outbound API integrations in
  `packages/shared-backend`, even when only one application uses them initially.
- Do not add a new outbound API client to an application backend. Existing API
  clients outside `shared-backend` are legacy and may remain until they are
  migrated.
- When replacing a legacy integration, move its client and reusable service
  behavior to `shared-backend` instead of creating another application-local
  path.
- Keep host-specific application setup, routes, and composition in the relevant
  app backend.
- Put contracts shared by frontend and backend in `packages/shared-domain`.
- Reuse an existing shared client, service, middleware, error type, logger, or
  utility before creating another path.
- Keep dependencies directed from app backends to shared packages, never from a
  shared package to an app package.

## Shared API service pattern

Organize an outbound API integration under
`packages/shared-backend/src/services/<area>` with a private client and a public
service.

### Client

- Keep the client generic and limited to transport concerns: endpoint paths,
  HTTP methods, headers, serialization, and response parsing.
- Do not put application-specific decisions, fallback behavior, orchestration,
  or domain workflows in the client.
- Keep the client package-private. It may be exported from its own module for
  its service to import, but never export it from the services barrel or the
  package root.
- Do not import a shared-backend client directly from an application package.

### Service

- Make the service the public boundary of the integration.
- A service may validate input, map data, apply domain rules, choose fallbacks,
  record metrics, and compose one or more private clients.
- Export a `create<Area>Service` factory and its `<Area>Service` type from the
  services barrel. Do not expose the internal client type as public API.
- Accept stable dependencies and configuration in the factory. This includes
  base URLs, source selection, metrics, and collaborating services.
- Pass request-specific values, such as access tokens, identifiers, and
  payloads, to service methods instead of storing them globally.
- Default to the internal client while allowing narrow dependency injection for
  isolated service tests.

### Initialization

- Initialize shared services once in the consuming application's composition
  root, normally `src/services/index.ts`.
- Read application configuration at that boundary and pass explicit values to
  the service factory. Do not read application environment variables inside a
  shared client or service.
- Export initialized service instances to routes and other application
  services. Do not construct the same configured service in individual route
  handlers.
- In tests, call the factory directly with controlled configuration or injected
  dependencies.

## Responsibilities and boundaries

- Keep HTTP concerns at the route or middleware boundary: authentication,
  request parsing, input validation, status codes, headers, and response
  mapping.
- Validate untrusted input at the boundary with existing validation helpers.
  Do not rely on frontend validation.
- Preserve existing API contracts unless compatibility and migration are
  explicit parts of the change.
- Document endpoint-specific request, response, and error behavior in its
  specification, API contract, and tests. Do not promote one endpoint's shape
  into this skill.

## Errors and recovery

- Use `ResponseError` from `shared-domain` for expected failures in new backend
  code. It is the canonical error model used by `shared-backend`.
- Choose a semantic `ErrorCode`, such as `BAD_REQUEST`, `NOT_FOUND`, or
  `SERVICE_UNAVAILABLE`. Let the shared error handler map the code to an HTTP
  status and the standard `ErrorResponse` body.
- Use `message` for a concise English diagnostic that is safe to include in the
  response, `userMessage` for intentional end-user wording, and
  `correlationId` to preserve an upstream correlation ID.
- Keep `ResponseError` and `ErrorCode` in `shared-domain` because they define a
  contract shared by services, servers, and consumers. Keep HTTP response
  mapping and middleware in `shared-backend`.
- Do not introduce new application-specific `HttpError`, `ApiError`, numeric
  status error, or unrelated response shape. Those models are legacy; migrate a
  touched flow to `ResponseError` when it can be done without changing its
  public contract unintentionally.
- Throw `ResponseError` from clients and services when deliberately reporting
  an expected failure. Let unexpected errors propagate to centralized handling.
  Do not send an HTTP response or choose Express response details below the
  route and error-middleware boundary.
- Use the centralized Express error middleware so failures produce the standard
  error code, message, user message, and correlation ID. Do not hand-build
  error responses in new routes.
- Forward asynchronous route failures through the existing route wrapper or
  Express error flow.
- Map expected failures to intentional status codes and safe user-facing
  messages.
- Treat unexpected failures as server errors. Log diagnostic details without
  returning stack traces, tokens, personal data, or upstream response bodies to
  the client.
- Preserve and return the correlation ID through failed internal and outbound
  requests.
- Do not catch an error unless the code can add context, map it to the public
  contract, retry it safely, or perform recovery. Never return a success-shaped
  fallback for a failed operation.
- Define timeout, retry, idempotency, and partial-failure behavior explicitly
  for state-changing or external operations. Do not add retries without proving
  duplicate effects are safe.

## Security and specialist routing

- Enforce authentication and authorization on the server at the protected
  boundary. Never trust a client-provided identity, role, or permission.
- Do not log form answers, personal data, credentials, access tokens, cookies,
  or full authorization headers.
- Keep secrets in the established environment or platform configuration. Never
  add secrets to source, fixtures, logs, or error responses.

Consult the matching specialist instead of inventing platform rules:

- `auth-agent` for Azure AD, TokenX, ID-porten, Maskinporten, JWT validation,
  identities, and token exchange;
- `nais-agent` for Nais, GCP resources, Kafka, deployment, and platform
  configuration;
- `observability-agent` for Prometheus metrics, OpenTelemetry tracing, Grafana,
  and alerts;
- `security-champion-agent` for threat modelling, security architecture,
  compliance, and privacy controls.

Use the repository's dedicated security review workflow when the task is to
find exploitable vulnerabilities.

## Logging and observability

- Use the existing structured backend logger. Do not add ad hoc console
  logging.
- Preserve correlation IDs across request handling, outbound calls, logs, and
  error responses.
- Log enough context to identify the operation and failure without logging
  sensitive payloads.
- Reuse existing metric names and services when extending the same behavior.
  Consult `observability-agent` before introducing a new metric, trace, alert,
  or dashboard contract.

## Backend testing

- Use Vitest for isolated backend, service, mapper, validator, and domain logic.
- Use the existing Supertest patterns for Express routes and middleware when
  the HTTP contract matters.
- Test external clients at their boundary with the repository's existing mock
  patterns. Cover request mapping, response mapping, and representative
  dependency failures.
- Use `request-body-verification` when a Cypress journey must prove the body
  that a backend sends to an external service.
- Cover the normal path and changed validation, authorization, dependency
  failure, and recovery behavior.
- Assert public status codes and response contracts without coupling tests to
  private implementation details.
- Use Cypress only when browser-to-backend behavior is part of the outcome, not
  for isolated backend logic.

## Before asking the user

Check this skill, nearby code and tests, current contracts, and the relevant
specialist guidance first. Treat established rules as facts. Ask only about
product behavior, API-specific contracts, meaningful trade-offs, or deliberate
exceptions.

If a requested exception conflicts with a rule here:

1. explain the existing default and why it applies;
2. confirm that the user intends to change it;
3. record the scope and compatibility effect;
4. add tests that distinguish the exception from the default.

## Maintaining this skill

This skill may be updated from an approved specification only when the decision
is:

- cross-cutting across backend features, services, or integrations;
- stable enough to guide future work;
- verified through repository evidence or an approved specification;
- not an endpoint-specific contract, one-off feature requirement, or temporary
  implementation detail.

Never update the skill silently. Show the exact proposed rule and require
explicit approval for it. Keep one rule in one place and remove or replace
outdated guidance.
