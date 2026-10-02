import { readFileSync } from 'node:fs';
import {
  caseModeLabel,
  escapeHtml,
  getPublicCleanup,
  getPublicSetupActions,
  journeyStatusLabels,
  list,
  priorityLabels,
  publicIntegrationOptions,
} from './format.mjs';

const renderHtml = (ctx, { generatedAt, templatePath }) => {
  const {
    plan,
    behaviors,
    integrations,
    internBaseUrl,
    ansattBaseUrl,
    revisionEndpoint,
    revisionField,
    expectedCommit,
  } = ctx;
  const publicCleanup = getPublicCleanup(plan);
  const coverageGapsHtml = plan.scope.notCoveredByTests.length
    ? `<ul>${plan.scope.notCoveredByTests.map((gap) => `<li>${escapeHtml(gap.area)}: ${escapeHtml(gap.reason)}</li>`).join('')}</ul>`
    : '<p>Ingen kjente hull i testtilfellene.</p>';
  const scopeHtml = `<section class="card" id="dekning">
      <h2>Dekning</h2>
      ${plan.scope.included.length ? `<h3>Dette testes</h3>${list(plan.scope.included)}` : ''}
      <h3>Ikke dekket av testtilfellene</h3>${coverageGapsHtml}
      ${plan.scope.excluded.length ? `<h3>Utenfor denne endringen</h3>${list(plan.scope.excluded)}` : ''}
    </section>`;
  const sourceNumber = plan.source.number ? ` #${escapeHtml(plan.source.number)}` : '';
  const setupHtml = getPublicSetupActions(plan)
    .map((item) => {
      return `<section class="setup-card">
      <h3>${escapeHtml(item.title)}</h3>
      ${list(item.steps)}
      <p><strong>Forventet:</strong> ${escapeHtml(item.expected)}</p>
      <h4>Kontroller</h4>
      ${list(item.verification)}
      ${item.sharedStateWarning ? `<p><strong>Delt tilstand:</strong> ${escapeHtml(item.sharedStateWarning)}</p>` : ''}
    </section>`;
    })
    .join('');

  const formsHtml = plan.forms.length
    ? `<div class="table-scroll" tabindex="0" role="region" aria-label="Skjema som brukes">
    <table>
      <thead><tr><th>Type</th><th>Skjema</th><th>Skjemanummer</th><th>Merknad</th></tr></thead>
      <tbody>${plan.forms
        .map(
          (form) =>
            `<tr><td>${escapeHtml(form.kind === 'production' ? 'Produksjonsskjema' : 'Testskjema')}</td><td>${escapeHtml(
              form.title,
            )}</td><td><a href="${escapeHtml(`${internBaseUrl}/${encodeURIComponent(form.path)}`)}">${escapeHtml(form.skjemanummer)}</a></td><td>${escapeHtml(form.notes ?? '')}</td></tr>`,
        )
        .join('')}</tbody>
    </table>
  </div>`
    : '<p>Ingen egne skjema må klargjøres.</p>';

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
  const renderIntegrationEvidenceHtml = (
    option,
    groupName,
    open,
  ) => `<details name="${groupName}" class="integration-evidence"${open ? ' open' : ''}>
  <summary>${escapeHtml(verificationOptionTitle(option))}</summary>
  <div>
  <p><strong>Hvem:</strong> ${escapeHtml(option.owner)}</p>
  ${option.url ? `<p><a href="${escapeHtml(option.url)}">Åpne ${escapeHtml(verificationOptionTitle(option))}</a></p>` : ''}
  <ol>${option.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
  <p><strong>Forventet:</strong> ${escapeHtml(option.expected)}</p>
  </div>
</details>`;
  const behaviorsHtml = `<ol class="behavior-list">
  ${plan.behaviorAnalysis
    .map(
      (behavior) =>
        `<li>
          <details class="behavior-card" id="${behavior.id.toLowerCase()}" tabindex="-1">
            <summary><code>${escapeHtml(behavior.id)}</code>: ${escapeHtml(behavior.behavior)}</summary>
            <div>
              <dl class="behavior-fields">
                <div class="behavior-field"><dt>Før</dt><dd>${escapeHtml(behavior.before)}</dd></div>
                <div class="behavior-field"><dt>Ønsket oppførsel</dt><dd>${escapeHtml(behavior.intended)}</dd></div>
                <div class="behavior-field"><dt>Oppførsel i endringen</dt><dd>${escapeHtml(behavior.implemented)}</dd></div>
                <div class="behavior-field behavior-field--wide"><dt>Grunnlag</dt><dd>${list(behavior.evidence)}</dd></div>
                <div class="behavior-field"><dt>Status</dt><dd>${escapeHtml(behaviorStatusLabels[behavior.status])}</dd></div>
                <div class="behavior-field"><dt>Sikkerhet i vurderingen</dt><dd>${escapeHtml(
                  behaviorConfidenceLabels[behavior.confidence],
                )}</dd></div>
              </dl>
            </div>
          </details>
        </li>`,
    )
    .join('')}
</ol>`;

  const casesHtml = plan.testCases
    .map((testCase) => {
      const form = plan.forms.find((candidate) => candidate.id === testCase.formId);
      const testUsers = testCase.testUsers ?? [];
      const publicIntegrationEvidence = (testCase.integrationIds ?? [])
        .map((id) => {
          const options = publicIntegrationOptions(integrations.get(id), plan.collaboration.withNonDevelopers);
          if (!options.length) return '';
          const groupName = `verification-${testCase.id}-${id}`;
          return `<section class="verification-group">
          <h3>${options.length > 1 ? 'Velg kontrollmåte' : 'Kontroller resultatet'}</h3>
          ${options.map((option) => renderIntegrationEvidenceHtml(option, groupName, options.length === 1)).join('')}
        </section>`;
        })
        .join('');
      const formLinks = form
        ? `<p><strong>Åpne skjemaet:</strong>
          <a href="${escapeHtml(`${internBaseUrl}/${encodeURIComponent(form.path)}`)}">intern-ingress</a>
          eller
          <a href="${escapeHtml(`${ansattBaseUrl}/${encodeURIComponent(form.path)}`)}">ansatt-ingress</a>
        </p>`
        : '';
      const testUserHtml = testUsers.length ? `<h3>Testbruker</h3>${list(testUsers)}` : '';
      return `<details class="test-case" id="${testCase.id.toLowerCase()}" tabindex="-1" open>
      <summary>${escapeHtml(testCase.id)}: ${escapeHtml(testCase.title)}</summary>
      <div>
        <div class="badges">
          <span class="badge">${escapeHtml(priorityLabels[testCase.priority])}</span>
          <span class="badge">${escapeHtml(testCase.group)}</span>
          <span class="badge">${caseModeLabel(testCase)}</span>
          ${testCase.journeyCheck.status === 'verified' ? '' : `<span class="badge">${escapeHtml(journeyStatusLabels[testCase.journeyCheck.status])}</span>`}
        </div>
        <p>${escapeHtml(testCase.purpose)}</p>
        <p><strong>Bakgrunn for testen:</strong> ${testCase.behaviorIds
          .map(
            (id) => `<a href="#${id.toLowerCase()}">${escapeHtml(id)}: ${escapeHtml(behaviors.get(id).behavior)}</a>`,
          )
          .join(', ')}</p>
        ${form ? `<p><strong>Skjema:</strong> ${escapeHtml(form.title)}</p>${formLinks}` : ''}
        <p><strong>Testløp:</strong> ${escapeHtml(testCase.journeyCheck.route)}</p>
        <details class="secondary-section">
          <summary>Om testløpet</summary>
          <div><p>${escapeHtml(journeyStatusLabels[testCase.journeyCheck.status])}: ${escapeHtml(testCase.journeyCheck.note)}</p></div>
        </details>
        ${testCase.prerequisites.length ? `<h3>Før du starter</h3>${list(testCase.prerequisites)}` : ''}
        ${testUserHtml}
        <h3>Steg</h3>
        <ol>${testCase.steps
          .map(
            (step) =>
              `<li class="step">${escapeHtml(step.action)}${step.command ? `<pre><code>${escapeHtml(step.command)}</code></pre>` : ''}${step.expected ? `<div class="expected"><strong>Forventet:</strong> ${escapeHtml(step.expected)}</div>` : ''}</li>`,
          )
          .join('')}</ol>
        ${testCase.evidence.length ? `<h3>Noter</h3>${list(testCase.evidence)}` : ''}
        ${publicIntegrationEvidence}
      </div>
    </details>`;
    })
    .join('');

  const setupSection = `<details class="secondary-section" id="oppsett">
    <summary><h2>Oppsett før testing - åpne hvis dette ikke allerede er gjort</h2></summary>
    <div>
      ${setupHtml || '<p>Ingen ekstra oppsett.</p>'}
      <h3>Skjema som brukes</h3>
      ${formsHtml}
    </div>
  </details>`;

  const behaviorSection = `<details class="secondary-section" id="oppforselsanalyse">
    <summary><h2>Bakgrunn for testene</h2></summary>
    <div>
      <h3>Risiko</h3>
      ${list(plan.risks ?? [])}
      <p>Forventede resultater bygger på avklart behov, etablerte avtaler eller uendret oppførsel.</p>
      ${behaviorsHtml}
    </div>
  </details>`;

  const technicalSection = `<details class="secondary-section" id="teknisk-informasjon">
    <summary><h2>Teknisk informasjon</h2></summary>
    <div class="meta">
      <p><strong>Pull request:</strong> <a href="${escapeHtml(plan.source.url)}">${escapeHtml(
        plan.source.repository,
      )}${sourceNumber}</a></p>
      ${
        plan.source.issue
          ? `<p><strong>Sak:</strong> <a href="${escapeHtml(plan.source.issue.url)}">#${escapeHtml(
              plan.source.issue.number,
            )}</a></p>`
          : ''
      }
      <p><strong>Miljø:</strong> ${escapeHtml(plan.environment.name)}</p>
      <p><strong>Gren:</strong> <code>${escapeHtml(plan.source.ref)}</code></p>
      <p><strong>Commit:</strong> <code>${escapeHtml(expectedCommit)}</code></p>
    </div>
  </details>`;

  const contentsHtml = `<nav class="contents" aria-label="Innhold">
    <h2>Innhold</h2>
    <ul>
      <li><a href="#dekning">Dekning</a></li>
      <li><a href="#versjon">Sjekk versjonen</a></li>
      <li><a href="#oppsett">Oppsett før testing</a></li>
      <li><a href="#testoppgaver">Testoppgaver</a>
        <ul>${plan.testCases.map((testCase) => `<li><a href="#${testCase.id.toLowerCase()}">${escapeHtml(testCase.id)}: ${escapeHtml(testCase.title)}</a></li>`).join('')}</ul>
      </li>
      <li><a href="#opprydding">Rydd opp etter testing</a></li>
      <li><a href="#oppforselsanalyse">Bakgrunn for testene</a></li>
      <li><a href="#teknisk-informasjon">Teknisk informasjon</a></li>
    </ul>
  </nav>`;

  const body = `<div class="page-tools">
    <button id="theme-toggle" type="button" aria-pressed="false">
      Mørkt tema: <span id="theme-state">av</span>
    </button>
  </div>
  <h1>${escapeHtml(plan.title)}</h1>
  <p>${escapeHtml(plan.summary)}</p>
  <p>Bruk bare syntetiske personopplysninger og filer.</p>
  ${contentsHtml}
  ${scopeHtml}
  <section class="card preflight" id="versjon">
    <h2>Sjekk versjonen før du tester</h2>
    <p>Åpne <a href="${escapeHtml(revisionEndpoint)}">miljøinformasjonen</a>. Sjekk at <code>${escapeHtml(revisionField)}</code> er <code>${escapeHtml(expectedCommit)}</code>. Hvis ikke, be utvikleren legge ut riktig versjon.</p>
  </section>
  ${setupSection}
  <section id="testoppgaver">
    <h2>Testoppgaver</h2>
    ${casesHtml}
  </section>
  <section class="card" id="opprydding" aria-labelledby="cleanup-heading">
    <h2 id="cleanup-heading">Rydd opp etter testing</h2>
    ${
      publicCleanup.length
        ? `<ul class="cleanup-checklist">${publicCleanup.map((step) => `<li><label><input type="checkbox" />${escapeHtml(step)}</label></li>`).join('')}</ul>`
        : '<p>Ingen opprydding nødvendig.</p>'
    }
  </section>
  ${behaviorSection}
  ${technicalSection}`;

  const htmlTemplate = readFileSync(templatePath, 'utf8');
  return htmlTemplate
    .replace('{{TITLE}}', () => escapeHtml(plan.title))
    .replace('{{BODY}}', () => body)
    .replace('{{GENERATED_AT}}', () => escapeHtml(generatedAt));
};

export { renderHtml };
