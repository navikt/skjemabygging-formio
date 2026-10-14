import { execFileSync } from 'node:child_process';
import { fail } from './errors.mjs';

const citationPattern = /^([^:\s]+):(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*)\s*(?:\(([a-f\d]{40})\))?$/i;
const looksLikeCitation = (text) => /^[^:\s]+:\d/.test(text);

const validateSources = (plan, repository) => {
  const readGit = (args) =>
    execFileSync('git', ['-C', repository, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
  try {
    readGit(['rev-parse', '--git-dir']);
  } catch {
    fail('--source-repo must identify an available Git repository');
  }
  const revisions = [plan.source.commitSha, ...(plan.source.relatedPullRequests ?? []).map((pr) => pr.commitSha)];
  for (const revision of revisions) {
    try {
      readGit(['cat-file', '-e', `${revision}^{commit}`]);
    } catch {
      fail(`source commit ${revision} is unavailable in --source-repo; fetch the committed object first`);
    }
  }
  for (const related of plan.source.relatedPullRequests ?? []) {
    try {
      readGit(['merge-base', '--is-ancestor', related.commitSha, plan.source.commitSha]);
    } catch {
      fail(
        `could not establish related pull request #${related.number} commit as an ancestor of source.commitSha; check the analyzed revision and fetched history`,
      );
    }
  }

  const lineCounts = new Map();
  const validateCitation = (text) => {
    if (!looksLikeCitation(text)) return false;
    const match = text.match(citationPattern);
    if (!match) fail(`invalid source citation: ${text}`);
    const [, path, ranges, explicitCommit] = match;
    if (path.startsWith('/') || path.includes('\\') || path.split('/').some((part) => part === '..' || part === '')) {
      fail(`source citation must use a repository-relative file path: ${path}`);
    }
    const commit = explicitCommit ?? plan.source.commitSha;
    const object = `${commit}:${path}`;
    if (!lineCounts.has(object)) {
      let content;
      let objectType;
      try {
        objectType = readGit(['cat-file', '-t', object]).trim();
        if (objectType === 'blob') {
          content = readGit(['show', '--no-ext-diff', '--no-textconv', object]);
        }
      } catch {
        fail(`source citation file is unavailable at ${commit}: ${path}`);
      }
      if (objectType !== 'blob') {
        fail(`source citation must identify a committed file: ${path}`);
      }
      lineCounts.set(object, content === '' ? 0 : content.replace(/\n$/, '').split('\n').length);
    }
    for (const range of ranges.split(',')) {
      const [start, end = start] = range.split('-').map(Number);
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 1 ||
        end < start ||
        end > lineCounts.get(object)
      ) {
        fail(`source citation range ${range} is outside ${path} (${lineCounts.get(object)} lines at ${commit})`);
      }
    }
    return true;
  };

  for (const behavior of plan.behaviorAnalysis) {
    behavior.evidence.forEach(validateCitation);
  }
  for (const testCase of plan.testCases) {
    const citations = (testCase.journeyCheck.evidence ?? []).map(validateCitation);
    if (testCase.journeyCheck.status === 'source-mapped' && !citations.some(Boolean)) {
      fail(`${testCase.id} source-mapped journey requires a committed file/line citation`);
    }
  }
};

export { validateSources };
