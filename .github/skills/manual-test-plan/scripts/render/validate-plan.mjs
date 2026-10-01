import { fail } from './errors.mjs';
import { asHttpUrl, asNonEmptyString, asStringArray } from './validators.mjs';

const validatePlan = (plan) => {
  if (plan.schemaVersion !== 4) {
    fail('schemaVersion must be 4');
  }

  asNonEmptyString(plan.slug, 'slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug)) {
    fail('slug must contain lowercase letters, numbers, and hyphens only');
  }
  asNonEmptyString(plan.title, 'title');
  asNonEmptyString(plan.summary, 'summary');
  if (!plan.scope || typeof plan.scope !== 'object') {
    fail('scope must contain included, excluded, and notCoveredByTests lists');
  }
  {
    asStringArray(plan.scope.included, 'scope.included');
    asStringArray(plan.scope.excluded, 'scope.excluded');
    if (!Array.isArray(plan.scope.notCoveredByTests)) {
      fail('scope.notCoveredByTests must be an array');
    }
    for (const [index, gap] of plan.scope.notCoveredByTests.entries()) {
      asNonEmptyString(gap.area, `scope.notCoveredByTests[${index}].area`);
      asNonEmptyString(gap.reason, `scope.notCoveredByTests[${index}].reason`);
    }
  }
  if (!plan.collaboration || typeof plan.collaboration.withNonDevelopers !== 'boolean') {
    fail('collaboration.withNonDevelopers must be a boolean');
  }

  if (!plan.source || typeof plan.source !== 'object') {
    fail('source is required');
  }
  const sourceRepository = asNonEmptyString(plan.source.repository, 'source.repository');
  if (!/^[^/\s]+\/[^/\s]+$/.test(sourceRepository)) {
    fail('source.repository must use owner/repository format');
  }
  if (plan.source.type !== 'pull-request') {
    fail('source.type must be pull-request');
  }
  if (!Number.isInteger(plan.source.number) || plan.source.number <= 0) {
    fail('source.number must be a positive pull request number');
  }
  const sourceUrl = new URL(asHttpUrl(plan.source.url, 'source.url'));
  if (
    sourceUrl.hostname !== 'github.com' ||
    sourceUrl.pathname.replace(/\/$/, '') !== `/${sourceRepository}/pull/${plan.source.number}`
  ) {
    fail('source.url must match source.repository and source.number');
  }
  if (plan.source.issue !== undefined) {
    const issueUrl = new URL(asHttpUrl(plan.source.issue?.url, 'source.issue.url'));
    if (
      !plan.source.issue ||
      !Number.isInteger(plan.source.issue.number) ||
      plan.source.issue.number <= 0 ||
      issueUrl.hostname !== 'github.com' ||
      issueUrl.pathname.replace(/\/$/, '') !== `/${sourceRepository}/issues/${plan.source.issue.number}`
    ) {
      fail('source.issue must identify an issue in source.repository');
    }
  }
  asNonEmptyString(plan.source.ref, 'source.ref');
  const expectedCommit = asNonEmptyString(plan.source.commitSha, 'source.commitSha');
  if (!/^[0-9a-f]{40}$/i.test(expectedCommit)) {
    fail('source.commitSha must be a 40-character Git commit SHA');
  }

  if (!plan.environment || typeof plan.environment !== 'object') {
    fail('environment is required');
  }
  const environmentName = asNonEmptyString(plan.environment.name, 'environment.name');
  if (!['preprod', 'preprod-alt'].includes(environmentName)) {
    fail('environment.name must be preprod or preprod-alt');
  }
  const internBaseUrl = asHttpUrl(plan.environment.internBaseUrl, 'environment.internBaseUrl').replace(/\/$/, '');
  const ansattBaseUrl = asHttpUrl(plan.environment.ansattBaseUrl, 'environment.ansattBaseUrl').replace(/\/$/, '');
  if (!plan.environment.revisionCheck || typeof plan.environment.revisionCheck !== 'object') {
    fail('environment.revisionCheck is required');
  }
  const revisionEndpoint = asHttpUrl(plan.environment.revisionCheck.endpoint, 'environment.revisionCheck.endpoint');
  const revisionField = asNonEmptyString(plan.environment.revisionCheck.field, 'environment.revisionCheck.field');
  const matchesEnvironment = ['fyllut', 'skjemabygging'].some(
    (application) =>
      new URL(internBaseUrl).hostname === `${application}-${environmentName}.intern.dev.nav.no` &&
      new URL(ansattBaseUrl).hostname === `${application}-${environmentName}.ansatt.dev.nav.no` &&
      new URL(revisionEndpoint).hostname === `${application}-${environmentName}.intern.dev.nav.no`,
  );
  if (!matchesEnvironment) {
    fail('environment URLs must all point to the selected preprod environment and ingresses');
  }

  if (
    !Array.isArray(plan.integrations) ||
    !Array.isArray(plan.setupActions) ||
    !Array.isArray(plan.forms) ||
    !Array.isArray(plan.testCases)
  ) {
    fail('integrations, setupActions, forms, and testCases must be arrays');
  }

  plan.risks = asStringArray(plan.risks ?? [], 'risks');

  if (!Array.isArray(plan.behaviorAnalysis) || plan.behaviorAnalysis.length === 0) {
    fail('behaviorAnalysis must contain at least one behavior');
  }
  const behaviors = new Map();
  for (const [index, behavior] of plan.behaviorAnalysis.entries()) {
    const prefix = `behaviorAnalysis[${index}]`;
    const id = asNonEmptyString(behavior.id, `${prefix}.id`);
    if (!/^B-\d+$/.test(id)) {
      fail(`${prefix}.id must match B-<number>`);
    }
    if (behaviors.has(id)) {
      fail(`duplicate behavior id: ${id}`);
    }
    for (const field of ['behavior', 'before', 'intended', 'implemented']) {
      asNonEmptyString(behavior[field], `${prefix}.${field}`);
    }
    const evidence = asStringArray(behavior.evidence, `${prefix}.evidence`);
    if (evidence.length === 0) {
      fail(`${prefix}.evidence must contain at least one source`);
    }
    if (!['high', 'medium', 'low'].includes(behavior.confidence)) {
      fail(`${prefix}.confidence must be high, medium, or low`);
    }
    if (!['aligned', 'suspected-defect', 'open-question'].includes(behavior.status)) {
      fail(`${prefix}.status must be aligned, suspected-defect, or open-question`);
    }
    if (behavior.status === 'open-question' && behavior.confidence === 'high') {
      fail(`${prefix} open questions cannot have high confidence`);
    }
    if (behavior.status !== 'open-question' && behavior.confidence !== 'high') {
      fail(`${prefix} aligned and suspected-defect behaviors require high confidence`);
    }
    behaviors.set(id, behavior);
  }

  const formIds = new Set();
  for (const [index, form] of plan.forms.entries()) {
    const prefix = `forms[${index}]`;
    const id = asNonEmptyString(form.id, `${prefix}.id`);
    if (formIds.has(id)) {
      fail(`duplicate form id: ${id}`);
    }
    formIds.add(id);
    if (!['production', 'generated'].includes(form.kind)) {
      fail(`${prefix}.kind must be production or generated`);
    }
    asNonEmptyString(form.path, `${prefix}.path`);
    asNonEmptyString(form.skjemanummer, `${prefix}.skjemanummer`);
    asNonEmptyString(form.title, `${prefix}.title`);
  }

  const integrations = new Map();
  for (const [index, integration] of plan.integrations.entries()) {
    const prefix = `integrations[${index}]`;
    const id = asNonEmptyString(integration.id, `${prefix}.id`);
    if (!/^INT-\d+$/.test(id)) {
      fail(`${prefix}.id must match INT-<number>`);
    }
    if (integrations.has(id)) {
      fail(`duplicate integration id: ${id}`);
    }
    asNonEmptyString(integration.system, `${prefix}.system`);
    if (!Array.isArray(integration.behaviorIds) || integration.behaviorIds.length === 0) {
      fail(`${prefix}.behaviorIds must contain at least one behavior id`);
    }
    for (const behaviorId of integration.behaviorIds) {
      if (!behaviors.has(behaviorId)) {
        fail(`${prefix}.behaviorIds references unknown behavior ${behaviorId}`);
      }
    }
    if (!integration.evidence || typeof integration.evidence !== 'object') {
      fail(`${prefix}.evidence is required`);
    }
    const options = integration.evidence.options;
    if (options !== undefined && (!Array.isArray(options) || options.length === 0)) {
      fail(`${prefix}.evidence.options must contain at least one option`);
    }
    const evidenceOptions = options ?? [integration.evidence];
    const optionIds = new Set();
    for (const [optionIndex, option] of evidenceOptions.entries()) {
      const optionPrefix = options ? `${prefix}.evidence.options[${optionIndex}]` : `${prefix}.evidence`;
      if (options) {
        const optionId = asNonEmptyString(option.id, `${optionPrefix}.id`);
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(optionId) || optionIds.has(optionId)) {
          fail(`${optionPrefix}.id must be unique and use lowercase letters, numbers, and hyphens`);
        }
        optionIds.add(optionId);
      }
      if (!['public', 'internal'].includes(option.audience)) {
        fail(`${optionPrefix}.audience must be public or internal`);
      }
      for (const field of ['method', 'owner', 'expected']) {
        asNonEmptyString(option[field], `${optionPrefix}.${field}`);
      }
      if (option.url !== undefined) {
        asHttpUrl(option.url, `${optionPrefix}.url`);
      }
      const instructions = asStringArray(option.instructions, `${optionPrefix}.instructions`);
      if (instructions.length === 0) {
        fail(`${optionPrefix}.instructions must contain at least one step`);
      }
      asStringArray(option.repositoryReferences ?? [], `${optionPrefix}.repositoryReferences`);
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
    integrations.set(id, integration);
  }

  const setupIds = new Set();
  for (const [index, action] of plan.setupActions.entries()) {
    const prefix = `setupActions[${index}]`;
    const id = asNonEmptyString(action.id, `${prefix}.id`);
    if (!/^SETUP-\d+$/.test(id)) {
      fail(`${prefix}.id must match SETUP-<number>`);
    }
    if (setupIds.has(id)) {
      fail(`duplicate setup action id: ${id}`);
    }
    setupIds.add(id);
    if (!['public', 'internal'].includes(action.audience)) {
      fail(`${prefix}.audience must be public or internal`);
    }
    if (
      !['forms-api-import', 'form-verification', 'test-user', 'feature-toggle', 'shared-state', 'other'].includes(
        action.kind,
      )
    ) {
      fail(`${prefix}.kind is invalid`);
    }
    asNonEmptyString(action.title, `${prefix}.title`);
    asNonEmptyString(action.expected, `${prefix}.expected`);
    const steps = asStringArray(action.steps, `${prefix}.steps`);
    const verification = asStringArray(action.verification, `${prefix}.verification`);
    const cleanup = asStringArray(action.cleanup, `${prefix}.cleanup`);
    if (steps.length === 0 || verification.length === 0) {
      fail(`${prefix}.steps and verification must not be empty`);
    }
    if (action.formId && !formIds.has(action.formId)) {
      fail(`${prefix}.formId references unknown form ${action.formId}`);
    }
    if (action.kind === 'forms-api-import') {
      if (!action.formId) {
        fail(`${prefix}.formId is required for Forms API imports`);
      }
      asNonEmptyString(action.sharedStateWarning, `${prefix}.sharedStateWarning`);
      if (cleanup.length === 0) {
        fail(`${prefix}.cleanup must describe restoration or retention`);
      }
    } else if (action.sharedStateWarning !== undefined) {
      asNonEmptyString(action.sharedStateWarning, `${prefix}.sharedStateWarning`);
    }
  }

  const caseIds = new Set();
  const referencedIntegrationIds = new Set();
  for (const [index, testCase] of plan.testCases.entries()) {
    const prefix = `testCases[${index}]`;
    const id = asNonEmptyString(testCase.id, `${prefix}.id`);
    if (!/^TC-\d+$/.test(id)) {
      fail(`${prefix}.id must match TC-<number>`);
    }
    if (caseIds.has(id)) {
      fail(`duplicate test case id: ${id}`);
    }
    caseIds.add(id);
    asNonEmptyString(testCase.group, `${prefix}.group`);
    asNonEmptyString(testCase.title, `${prefix}.title`);
    asNonEmptyString(testCase.purpose, `${prefix}.purpose`);
    if (!['verification', 'exploratory'].includes(testCase.mode)) {
      fail(`${prefix}.mode must be verification or exploratory`);
    }
    const journeyCheck = testCase.journeyCheck;
    if (!journeyCheck || !['verified', 'source-mapped', 'unverified'].includes(journeyCheck.status)) {
      fail(`${prefix}.journeyCheck.status must be verified, source-mapped, or unverified`);
    }
    asNonEmptyString(journeyCheck.route, `${prefix}.journeyCheck.route`);
    asNonEmptyString(journeyCheck.note, `${prefix}.journeyCheck.note`);
    const journeyEvidence = asStringArray(journeyCheck.evidence ?? [], `${prefix}.journeyCheck.evidence`);
    if (journeyCheck.status !== 'unverified' && journeyEvidence.length === 0) {
      fail(`${prefix}.journeyCheck.evidence must identify the route sources`);
    }
    if (testCase.mode === 'verification' && journeyCheck.status === 'unverified') {
      fail(`${prefix} verification cases require a source-mapped or browser-observed journey for this route`);
    }
    if (!Array.isArray(testCase.behaviorIds) || testCase.behaviorIds.length === 0) {
      fail(`${prefix}.behaviorIds must contain at least one behavior id`);
    }
    const linkedBehaviors = testCase.behaviorIds.map((behaviorId) => {
      asNonEmptyString(behaviorId, `${prefix}.behaviorIds`);
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
    if (!['P0', 'P1', 'P2', 'P3'].includes(testCase.priority)) {
      fail(`${prefix}.priority must be P0, P1, P2, or P3`);
    }
    if (testCase.formId && !formIds.has(testCase.formId)) {
      fail(`${prefix}.formId references unknown form ${testCase.formId}`);
    }
    const integrationIds = asStringArray(testCase.integrationIds ?? [], `${prefix}.integrationIds`);
    for (const integrationId of integrationIds) {
      if (!integrations.has(integrationId)) {
        fail(`${prefix}.integrationIds references unknown integration ${integrationId}`);
      }
      referencedIntegrationIds.add(integrationId);
    }
    for (const field of ['prerequisites', 'testUsers', 'evidence', 'cleanup']) {
      testCase[field] = asStringArray(testCase[field] ?? [], `${prefix}.${field}`);
    }
    if (!Array.isArray(testCase.steps) || testCase.steps.length === 0) {
      fail(`${prefix}.steps must contain at least one step`);
    }
    for (const [stepIndex, step] of testCase.steps.entries()) {
      asNonEmptyString(step.action, `${prefix}.steps[${stepIndex}].action`);
      if (step.expected !== undefined) {
        asNonEmptyString(step.expected, `${prefix}.steps[${stepIndex}].expected`);
      }
      if (step.command !== undefined) {
        asNonEmptyString(step.command, `${prefix}.steps[${stepIndex}].command`);
      }
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
    revisionEndpoint,
    revisionField,
    expectedCommit,
  };
};

export { validatePlan };
