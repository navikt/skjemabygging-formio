import {
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
  publicIntegrationOptions,
  setupLabels,
  shellBlock,
  verificationOptionTitle,
} from './format.mjs';

const renderSetupMarkdown = (item, includeCleanup = true) => {
  const labels = setupLabels[item.audience];
  return `### ${item.id}: ${escapeMarkdown(item.title)}

${item.steps.map((step) => `1. ${escapeMarkdown(step)}`).join('\n')}

**${labels.expected}:** ${escapeMarkdown(item.expected)}

**${labels.verification}:**
${item.verification.map((step) => `- ${escapeMarkdown(step)}`).join('\n')}
${item.sharedStateWarning ? `\n**${labels.sharedState}:** ${escapeMarkdown(item.sharedStateWarning)}\n` : ''}
${includeCleanup && item.cleanup.length ? `**${labels.cleanup}:**\n${item.cleanup.map((step) => `- ${escapeMarkdown(step)}`).join('\n')}` : ''}`;
};

const renderIssue = (ctx) => {
  const { plan, behaviors, integrations, internBaseUrl, ansattBaseUrl, expectedBranch } = ctx;
  const publicCleanup = getPublicCleanup(plan);
  const scopeMarkdown = `## Dekning

${plan.scope.included.length ? `**Dette testes:**\n${plan.scope.included.map((item) => `- ${escapeMarkdown(item)}`).join('\n')}` : ''}

**Ikke dekket av testtilfellene:**
${plan.scope.notCoveredByTests.length ? plan.scope.notCoveredByTests.map((gap) => `- ${escapeMarkdown(gap.area)}: ${escapeMarkdown(gap.reason)}`).join('\n') : 'Ingen kjente hull i testtilfellene.'}

${plan.scope.excluded.length ? `**Utenfor denne endringen:**\n${plan.scope.excluded.map((item) => `- ${escapeMarkdown(item)}`).join('\n')}` : ''}`;
  const issueBehaviors = plan.behaviorAnalysis
    .map(
      (behavior) => `<details>
<summary><code>${behavior.id}</code>: ${escapeHtml(behavior.behavior)}</summary>

### ${behavior.id}

- **Før:** ${escapeMarkdown(behavior.before)}
- **Ønsket oppførsel:** ${escapeMarkdown(behavior.intended)}
- **Oppførsel i endringen:** ${escapeMarkdown(behavior.implemented)}
- **Status:** ${behaviorStatusLabels[behavior.status]}
- **Sikkerhet i vurderingen:** ${behaviorConfidenceLabels[behavior.confidence]}
- **Grunnlag:** ${behavior.evidence.map(escapeMarkdown).join('; ')}

</details>`,
    )
    .join('\n\n');
  const issueSetup = getPublicSetupActions(plan)
    .map((item) => renderSetupMarkdown(item, false))
    .join('\n\n');
  const issueForms = plan.forms.length
    ? plan.forms
        .map(
          (form) =>
            `- **${escapeMarkdown(form.title)} (${escapeMarkdown(form.skjemanummer)}):** [intern-ingress](${internBaseUrl}/${encodeURIComponent(
              form.path,
            )}) eller [ansatt-ingress](${ansattBaseUrl}/${encodeURIComponent(form.path)})`,
        )
        .join('\n')
    : 'Ingen egne skjema må klargjøres.';
  const issueCases = plan.testCases
    .map((testCase) => {
      const form = plan.forms.find((candidate) => candidate.id === testCase.formId);
      const testUsers = testCase.testUsers ?? [];
      const publicIntegrationEvidence = (testCase.integrationIds ?? [])
        .map((id) => integrations.get(id))
        .flatMap((integration) =>
          publicIntegrationOptions(integration, plan.collaboration.withNonDevelopers).map(
            (option) => `**${escapeMarkdown(verificationOptionTitle(option))}**

**Hvem:** ${escapeMarkdown(option.owner)}

${option.url ? `[Åpne ${escapeMarkdown(option.method)}](${evidenceUrl(option.url)})\n\n` : ''}
${option.instructions.map((step, index) => `${index + 1}. ${escapeMarkdown(step)}`).join('\n')}

**Forventet:** ${escapeMarkdown(option.expected)}`,
          ),
        )
        .join('\n\n');
      const formText = form
        ? `**Skjema:** [intern-ingress](${internBaseUrl}/${encodeURIComponent(
            form.path,
          )}) eller [ansatt-ingress](${ansattBaseUrl}/${encodeURIComponent(form.path)})`
        : '';
      const testUserText = testUsers.length
        ? `**Testbruker:**\n${testUsers.map((value) => `- ${escapeMarkdown(value)}`).join('\n')}\n`
        : '';
      return `### ${testCase.id}: ${escapeMarkdown(testCase.title)} (${testCase.priority})

**Område:** ${escapeMarkdown(testCase.group)}
**Type:** ${caseModeLabel(testCase)}
**Bakgrunn for testen:** ${testCase.behaviorIds.map((id) => `[${escapeMarkdown(id)}: ${escapeMarkdown(behaviors.get(id).behavior)}](#${id.toLowerCase()})`).join(', ')}
${escapeMarkdown(testCase.purpose)}

${formText}
**Testløp:** ${escapeMarkdown(testCase.journeyCheck.route)}. ${journeyStatusLabels[testCase.journeyCheck.status]}: ${escapeMarkdown(testCase.journeyCheck.note)}
**Før du starter:** ${testCase.prerequisites.map(escapeMarkdown).join('; ') || 'Ingen ekstra forutsetninger.'}
${testUserText}
**Steg:**
${testCase.steps.map((step, index) => `${index + 1}. ${escapeMarkdown(step.action)}${step.command ? `\n\n${shellBlock(step.command)}` : ''}${step.expected ? `\n\n**Forventet:** ${escapeMarkdown(step.expected)}` : ''}`).join('\n\n')}

**Dokumentasjon:** ${testCase.evidence.map(escapeMarkdown).join('; ') || 'Noter resultatet.'}
${publicIntegrationEvidence ? `\n${publicIntegrationEvidence}` : ''}`;
    })
    .join('\n\n');

  const issue = `# ${escapeMarkdown(plan.title)}

${escapeMarkdown(plan.summary)}

Bruk bare syntetiske personopplysninger og filer.

${scopeMarkdown}

## Kontroller versjonen hver gang du starter testingen

1. Åpne [applikasjonen i miljøet](${internBaseUrl}/).
2. Vis sidekilden med Ctrl+U, eller Cmd+Option+U på Mac.
3. Søk etter \`git-branch\`. Kontroller at verdien er \`${expectedBranch}\`.
4. Noter verdien av \`git-version\` sammen med testresultatene.

**Stopp hvis \`git-branch\` har en annen verdi.** Da er en annen endring lagt ut i miljøet. Kontakt utvikleren, og kontroller på nytt.

## Testoppgaver

${issueCases}

## Rydd opp etter testing

${publicCleanup.length ? publicCleanup.map((step) => `- [ ] ${escapeMarkdown(step)}`).join('\n') : 'Ingen opprydding nødvendig.'}

<details>
<summary>Oppsett og skjema</summary>

${issueSetup || 'Ingen ekstra oppsett.'}

### Skjema som brukes

${issueForms}

</details>

<details>
<summary>Bakgrunn og oppførselsanalyse</summary>

### Risiko

${plan.risks.map((risk) => `- ${escapeMarkdown(risk)}`).join('\n') || 'Ingen særskilt risiko registrert.'}

${issueBehaviors}

</details>

---

Pull request: ${plan.source.url}
${plan.source.issue ? `Sak: ${plan.source.issue.url}` : ''}
`;

  return issue;
};

const renderInternalInstructions = (ctx) => {
  const { plan } = ctx;
  const internalIntegrationEvidence = plan.integrations
    .flatMap((integration) =>
      integrationOptions(integration)
        .filter((option) => option.audience === 'internal')
        .map(
          (option) => `## ${integration.id}: ${escapeMarkdown(integration.system)}

**Method:** ${escapeMarkdown(option.method)}

**Owner:** ${escapeMarkdown(option.owner)}

${option.url ? `**URL:** ${evidenceUrl(option.url)}\n\n` : ''}
${option.instructions.map((step, index) => `${index + 1}. ${escapeMarkdown(step)}`).join('\n')}

**Expected:** ${escapeMarkdown(option.expected)}

${
  option.repositoryReferences?.length
    ? `**References:**\n${option.repositoryReferences.map((reference) => `- ${escapeMarkdown(reference)}`).join('\n')}`
    : ''
}`,
        ),
    )
    .join('\n\n');
  const internalSetup = getInternalSetupActions(plan)
    .map((item) => renderSetupMarkdown(item))
    .join('\n\n');
  const internalInstructions =
    internalSetup || internalIntegrationEvidence
      ? `# Internal instructions for PR #${plan.source.number}

Do not attach this file to Trello or publish it in a GitHub issue.

${internalSetup ? `## Internal setup\n\n${internalSetup}` : ''}

${internalIntegrationEvidence ? `## Integration evidence\n\n${internalIntegrationEvidence}` : ''}
`
      : undefined;

  return internalInstructions;
};

export { renderInternalInstructions, renderIssue };
