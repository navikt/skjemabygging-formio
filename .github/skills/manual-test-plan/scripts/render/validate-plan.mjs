import { fail } from './errors.mjs';
import { validateAgainstSchema } from './plan-schema.mjs';
import { asHttpUrl } from './validators.mjs';

// plan.schema.json owns the structure. This file owns what a schema cannot
// express: uniqueness, cross-references, URL relationships, and rules that
// depend on several fields.
const validatePlan = (plan) => {
  validateAgainstSchema(plan);

  const sourceRepository = plan.source.repository.trim();
  const sourceUrl = new URL(asHttpUrl(plan.source.url, 'source.url'));
  if (
    sourceUrl.hostname !== 'github.com' ||
    sourceUrl.pathname.replace(/\/$/, '') !== `/${sourceRepository}/pull/${plan.source.number}`
  ) {
    fail('source.url must match source.repository and source.number');
  }
  if (plan.source.issue !== undefined) {
    const issueUrl = new URL(asHttpUrl(plan.source.issue.url, 'source.issue.url'));
    if (
      issueUrl.hostname !== 'github.com' ||
      issueUrl.pathname.replace(/\/$/, '') !== `/${sourceRepository}/issues/${plan.source.issue.number}`
    ) {
      fail('source.issue must identify an issue in source.repository');
    }
  }
  const expectedCommit = plan.source.commitSha.trim();
  const expectedBranch = plan.source.ref.trim();

  const environmentName = plan.environment.name.trim();
  const internBaseUrl = asHttpUrl(plan.environment.internBaseUrl, 'environment.internBaseUrl').replace(/\/$/, '');
  const ansattBaseUrl = asHttpUrl(plan.environment.ansattBaseUrl, 'environment.ansattBaseUrl').replace(/\/$/, '');
  const matchesEnvironment = ['fyllut', 'skjemabygging'].some(
    (application) =>
      new URL(internBaseUrl).hostname === `${application}-${environmentName}.intern.dev.nav.no` &&
      new URL(ansattBaseUrl).hostname === `${application}-${environmentName}.ansatt.dev.nav.no`,
  );
  if (!matchesEnvironment) {
    fail('environment URLs must all point to the selected preprod environment and ingresses');
  }

  plan.risks = plan.risks ?? [];

  const behaviors = new Map();
  for (const [index, behavior] of plan.behaviorAnalysis.entries()) {
    const prefix = `behaviorAnalysis[${index}]`;
    if (behaviors.has(behavior.id)) {
      fail(`duplicate behavior id: ${behavior.id}`);
    }
    if (behavior.status === 'open-question' && behavior.confidence === 'high') {
      fail(`${prefix} open questions cannot have high confidence`);
    }
    if (behavior.status !== 'open-question' && behavior.confidence !== 'high') {
      fail(`${prefix} aligned and suspected-defect behaviors require high confidence`);
    }
    behaviors.set(behavior.id, behavior);
  }

  const formIds = new Set();
  for (const form of plan.forms) {
    if (formIds.has(form.id)) {
      fail(`duplicate form id: ${form.id}`);
    }
    formIds.add(form.id);
  }

  const integrations = new Map();
  for (const [index, integration] of plan.integrations.entries()) {
    const prefix = `integrations[${index}]`;
    if (integrations.has(integration.id)) {
      fail(`duplicate integration id: ${integration.id}`);
    }
    for (const behaviorId of integration.behaviorIds) {
      if (!behaviors.has(behaviorId)) {
        fail(`${prefix}.behaviorIds references unknown behavior ${behaviorId}`);
      }
    }
    const options = integration.evidence.options;
    const optionIds = new Set();
    for (const [optionIndex, option] of (options ?? []).entries()) {
      if (optionIds.has(option.id)) {
        fail(`${prefix}.evidence.options[${optionIndex}].id must be unique`);
      }
      optionIds.add(option.id);
    }
    if (
      integration.system === 'innsending-api' &&
      (!options ||
        (plan.collaboration.withNonDevelopers ? ['team-logs', 'joark', 'handoff'] : ['team-logs', 'joark']).some(
          (optionId) => !options.some((option) => option.id === optionId && option.audience === 'public'),
        ))
    ) {
      fail(
        `${prefix}.evidence.options must include public team-logs and joark options${plan.collaboration.withNonDevelopers ? ', plus handoff for collaboration' : ''}`,
      );
    }
    integrations.set(integration.id, integration);
  }

  const setupIds = new Set();
  for (const [index, action] of plan.setupActions.entries()) {
    const prefix = `setupActions[${index}]`;
    if (setupIds.has(action.id)) {
      fail(`duplicate setup action id: ${action.id}`);
    }
    setupIds.add(action.id);
    if (action.formId && !formIds.has(action.formId)) {
      fail(`${prefix}.formId references unknown form ${action.formId}`);
    }
  }

  const caseIds = new Set();
  const referencedIntegrationIds = new Set();
  for (const [index, testCase] of plan.testCases.entries()) {
    const prefix = `testCases[${index}]`;
    if (caseIds.has(testCase.id)) {
      fail(`duplicate test case id: ${testCase.id}`);
    }
    caseIds.add(testCase.id);
    const journeyCheck = testCase.journeyCheck;
    if (journeyCheck.status !== 'unverified' && (journeyCheck.evidence ?? []).length === 0) {
      fail(`${prefix}.journeyCheck.evidence must identify the route sources`);
    }
    if (testCase.mode === 'verification' && journeyCheck.status === 'unverified') {
      fail(`${prefix} verification cases require a source-mapped or browser-observed journey for this route`);
    }
    const linkedBehaviors = testCase.behaviorIds.map((behaviorId) => {
      const behavior = behaviors.get(behaviorId);
      if (!behavior) {
        fail(`${prefix}.behaviorIds references unknown behavior ${behaviorId}`);
      }
      return behavior;
    });
    if (
      testCase.mode === 'verification' &&
      linkedBehaviors.some((behavior) => behavior.status === 'open-question' || behavior.confidence !== 'high')
    ) {
      fail(`${prefix} verification cases require high-confidence behaviors without open questions`);
    }
    if (testCase.formId && !formIds.has(testCase.formId)) {
      fail(`${prefix}.formId references unknown form ${testCase.formId}`);
    }
    for (const integrationId of testCase.integrationIds ?? []) {
      if (!integrations.has(integrationId)) {
        fail(`${prefix}.integrationIds references unknown integration ${integrationId}`);
      }
      referencedIntegrationIds.add(integrationId);
    }
    for (const field of ['prerequisites', 'testUsers', 'evidence', 'cleanup']) {
      testCase[field] = testCase[field] ?? [];
    }
    if (testCase.mode === 'verification' && !testCase.steps.some((step) => step.expected?.trim())) {
      fail(`${prefix} verification cases require at least one expected result`);
    }
  }
  for (const integrationId of integrations.keys()) {
    if (!referencedIntegrationIds.has(integrationId)) {
      fail(`integration ${integrationId} is not referenced by a test case`);
    }
  }

  return {
    plan,
    behaviors,
    integrations,
    internBaseUrl,
    ansattBaseUrl,
    expectedBranch,
    expectedCommit,
  };
};

export { validatePlan };
