import { asHttpUrl } from './validators.mjs';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
const escapeMarkdown = (value) =>
  String(value)
    .replaceAll(/\s*\n\s*/g, ' ')
    .replaceAll(/\\/g, '\\\\')
    .replaceAll(/([`*_{}()#+.!|>~-])/g, '\\$1')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .replaceAll('<', '&lt;');
const shellBlock = (command) => {
  const fence = '~'.repeat(Math.max(3, ...[...command.matchAll(/~+/g)].map(([run]) => run.length + 1)));
  return `${fence}sh\n${command}\n${fence}`;
};

const list = (values) =>
  values.length ? `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : '<p>Ingen.</p>';
const integrationOptions = (integration) => integration.evidence.options ?? [integration.evidence];
const publicIntegrationOptions = (integration, withNonDevelopers) =>
  integrationOptions(integration).filter(
    (option) => option.audience === 'public' && (withNonDevelopers || option.id !== 'handoff'),
  );
const caseModeLabel = (testCase) => (testCase.mode === 'verification' ? 'Verifikasjon' : 'Utforskende');
const journeyStatusLabels = {
  verified: 'Prøvd i nettleser',
  'source-mapped': 'Kartlagt fra kilder, ikke prøvd i preprod',
  unverified: 'Testløpet er ikke kartlagt',
};
const evidenceUrl = (url) => asHttpUrl(url, 'evidence.url').replaceAll('(', '%28').replaceAll(')', '%29');
const behaviorStatusLabels = {
  aligned: 'Som forventet',
  'suspected-defect': 'Mulig feil',
  'open-question': 'Må undersøkes',
};
const behaviorConfidenceLabels = {
  high: 'Høy',
  medium: 'Middels',
  low: 'Lav',
};
const verificationOptionTitle = (option) =>
  ({ 'team-logs': 'Teamlogger i GCP', joark: 'Journalpost i Joark', handoff: 'Overlevering' })[option.id] ??
  option.method;
const priorityLabels = {
  P0: 'P0 - må testes',
  P1: 'P1 - bør testes',
  P2: 'P2 - test hvis det er tid',
  P3: 'P3 - valgfri kontroll',
};
const setupLabels = {
  public: { expected: 'Forventet', verification: 'Kontroller', sharedState: 'Delt tilstand', cleanup: 'Rydd opp' },
  internal: { expected: 'Expected', verification: 'Verify', sharedState: 'Shared state', cleanup: 'Cleanup' },
};
const getPublicSetupActions = (plan) => plan.setupActions.filter((action) => action.audience === 'public');
const getInternalSetupActions = (plan) => plan.setupActions.filter((action) => action.audience === 'internal');
const getPublicCleanup = (plan) => [
  ...getPublicSetupActions(plan).flatMap((action) => action.cleanup.map((step) => `${action.title}: ${step}`)),
  ...plan.testCases.flatMap((testCase) => testCase.cleanup.map((step) => `${testCase.id}: ${step}`)),
];

export {
  behaviorConfidenceLabels,
  behaviorStatusLabels,
  caseModeLabel,
  escapeHtml,
  escapeMarkdown,
  evidenceUrl,
  getInternalSetupActions,
  getPublicCleanup,
  getPublicSetupActions,
  integrationOptions,
  journeyStatusLabels,
  list,
  priorityLabels,
  publicIntegrationOptions,
  setupLabels,
  shellBlock,
  verificationOptionTitle,
};
