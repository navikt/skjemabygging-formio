#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '../../../..');

const fail = (message) => {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
};

const getArguments = (name) => {
  const values = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === name && process.argv[index + 1]) {
      values.push(process.argv[index + 1]);
    }
  }
  return values;
};

const getArgument = (name) => getArguments(name)[0];

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(`Usage:
  node publish-pages.mjs --artifacts <directory> --destination <relative-path>
  node publish-pages.mjs --artifacts <directory> --destination <relative-path> \\
    --apply --confirm <operation> [--include <file>] [--bootstrap]

Dry-run is the default. Only index.html is published unless --include is
provided more than once. --bootstrap creates gh-pages when it does not exist;
it does not enable Pages in repository settings.
`);
  process.exit(0);
}

const artifactArgument = getArgument('--artifacts');
const destinationArgument = getArgument('--destination');
if (!artifactArgument || !destinationArgument) {
  fail('--artifacts and --destination are required');
}

const artifactDirectory = resolve(artifactArgument);
if (!existsSync(artifactDirectory) || !lstatSync(artifactDirectory).isDirectory()) {
  fail(`artifact directory does not exist: ${artifactDirectory}`);
}

const normalizeDestination = (value) => value.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
const destination = normalizeDestination(destinationArgument);
if (!destination || destination.split('/').some((part) => part === '.' || part === '..' || !part)) {
  fail('destination must be a non-empty relative path without dot segments');
}
if (!/^manual-tests\/[a-z0-9][a-z0-9/-]*$/.test(destination)) {
  fail('destination must start with manual-tests/ and contain lowercase letters, numbers, slashes, or hyphens');
}

const includeArguments = getArguments('--include');
const includedFiles = includeArguments.length ? includeArguments : ['index.html'];
for (const includedFile of includedFiles) {
  if (
    !includedFile ||
    includedFile.includes('..') ||
    includedFile.startsWith('/') ||
    includedFile.split(/[\\/]/).some((part) => !part)
  ) {
    fail(`invalid included artifact path: ${includedFile}`);
  }
  const source = resolve(artifactDirectory, includedFile);
  if (relative(artifactDirectory, source).startsWith('..') || !existsSync(source)) {
    fail(`included artifact does not exist inside the artifact directory: ${includedFile}`);
  }
  if (lstatSync(source).isSymbolicLink()) {
    fail(`symbolic links cannot be published: ${includedFile}`);
  }
}

const git = (...args) =>
  execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const gh = (...args) =>
  execFileSync('gh', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const repository = (() => {
  try {
    return JSON.parse(gh('repo', 'view', '--json', 'nameWithOwner')).nameWithOwner;
  } catch (error) {
    fail(`could not determine GitHub repository: ${error.stderr?.toString().trim() || error.message}`);
  }
})();

const [owner, repositoryName] = repository.split('/');
const remoteUrl = git('remote', 'get-url', 'origin');
const authenticatedRemoteUrl = `https://github.com/${repository}.git`;
const branchExists = (() => {
  try {
    gh('api', `repos/${repository}/branches/gh-pages`);
    return true;
  } catch (error) {
    if (error.status === 1 && error.stderr?.toString().includes('HTTP 404')) {
      return false;
    }
    fail(`could not inspect gh-pages: ${error.stderr?.toString().trim() || error.message}`);
  }
})();

const pages = (() => {
  try {
    return JSON.parse(gh('api', `repos/${repository}/pages`));
  } catch {
    return undefined;
  }
})();

const shouldApply = process.argv.includes('--apply');
const shouldBootstrap = process.argv.includes('--bootstrap');
const operation = branchExists ? `PUBLISH:${destination}` : `BOOTSTRAP:${destination}`;

process.stdout.write(`Repository: ${repository}\n`);
process.stdout.write(`Branch: gh-pages (${branchExists ? 'exists' : 'missing'})\n`);
process.stdout.write(`Destination: ${destination}\n`);
process.stdout.write(`Files: ${includedFiles.join(', ')}\n`);
process.stdout.write(`Operation: ${operation}\n`);

if (pages?.html_url) {
  process.stdout.write(`Page URL: ${pages.html_url.replace(/\/$/, '')}/${destination}/\n`);
} else {
  process.stdout.write(
    `Expected URL after Pages is enabled: https://${owner}.github.io/${repositoryName}/${destination}/\n`,
  );
  process.stdout.write('GitHub Pages is not configured for this repository.\n');
}

if (!shouldApply) {
  const bootstrapFlag = branchExists ? '' : ' --bootstrap';
  process.stdout.write(`Dry run only. To apply, rerun with --apply${bootstrapFlag} --confirm '${operation}'.\n`);
  process.exit(0);
}

if (getArgument('--confirm') !== operation) {
  fail(`confirmation does not match current operation; expected '${operation}'`);
}
if (!branchExists && !shouldBootstrap) {
  fail('gh-pages does not exist; rerun with --bootstrap after confirmation');
}

const temporaryRoot = mkdtempSync(join(tmpdir(), 'manual-test-pages-'));
const worktreeDirectory = join(temporaryRoot, 'worktree');
const bootstrapBranchName = `manual-test-pages-${process.pid}-${Date.now()}`;
let worktreeCreated = false;
let bootstrapBranchCreated = false;
let publicationError;

try {
  if (branchExists) {
    git('fetch', authenticatedRemoteUrl, 'gh-pages');
    git('worktree', 'add', '--detach', worktreeDirectory, 'FETCH_HEAD');
    worktreeCreated = true;
  } else {
    git('worktree', 'add', '--detach', worktreeDirectory, 'HEAD');
    worktreeCreated = true;
    execFileSync('git', ['checkout', '--orphan', bootstrapBranchName], {
      cwd: worktreeDirectory,
      stdio: 'ignore',
    });
    bootstrapBranchCreated = true;
    execFileSync('git', ['rm', '-r', '--force', '--ignore-unmatch', '.'], {
      cwd: worktreeDirectory,
      stdio: 'ignore',
    });
  }

  const destinationDirectory = resolve(worktreeDirectory, destination);
  if (!destinationDirectory.startsWith(`${worktreeDirectory}${sep}`)) {
    throw new Error('resolved destination escapes the temporary worktree');
  }
  rmSync(destinationDirectory, { recursive: true, force: true });
  mkdirSync(destinationDirectory, { recursive: true });

  for (const includedFile of includedFiles) {
    const source = resolve(artifactDirectory, includedFile);
    const target = resolve(destinationDirectory, includedFile);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target, { recursive: true, dereference: false });
  }

  if (!branchExists) {
    writeFileSync(join(worktreeDirectory, '.nojekyll'), '');
  }

  execFileSync('git', ['add', '--', destination, ...(branchExists ? [] : ['.nojekyll'])], {
    cwd: worktreeDirectory,
    stdio: 'ignore',
  });

  const diffResult = spawnSync('git', ['diff', '--cached', '--quiet'], {
    cwd: worktreeDirectory,
    stdio: 'ignore',
  });

  if (diffResult.status === 0) {
    process.stdout.write('No publication changes were detected.\n');
  } else if (diffResult.status === 1) {
    execFileSync('git', ['status', '--short'], { cwd: worktreeDirectory, stdio: 'inherit' });
    execFileSync(
      'git',
      [
        'commit',
        '-m',
        `docs(manual-test): publish ${basename(destination)}`,
        '-m',
        'Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>',
      ],
      { cwd: worktreeDirectory, stdio: 'inherit' },
    );
    const askPassPath = join(temporaryRoot, 'git-askpass.sh');
    writeFileSync(
      askPassPath,
      '#!/bin/sh\ncase "$1" in\n  *Username*) printf "%s\\n" "x-access-token" ;;\n  *Password*) exec gh auth token ;;\nesac\n',
      { mode: 0o700 },
    );
    execFileSync('git', ['push', authenticatedRemoteUrl, 'HEAD:gh-pages'], {
      cwd: worktreeDirectory,
      env: {
        ...process.env,
        GIT_ASKPASS: askPassPath,
        GIT_TERMINAL_PROMPT: '0',
      },
      stdio: 'inherit',
    });
    process.stdout.write(`Published ${destination} to ${remoteUrl} on gh-pages.\n`);
    if (!pages) {
      process.stdout.write(
        `Enable GitHub Pages once at https://github.com/${repository}/settings/pages using branch gh-pages and folder / (root).\n`,
      );
    }
  } else {
    throw new Error('could not determine whether publication content changed');
  }
} catch (error) {
  publicationError = error;
} finally {
  if (worktreeCreated) {
    try {
      git('worktree', 'remove', '--force', worktreeDirectory);
    } catch {
      process.stderr.write(`Warning: could not remove temporary worktree ${worktreeDirectory}\n`);
    }
  }
  if (bootstrapBranchCreated) {
    try {
      git('branch', '-D', bootstrapBranchName);
    } catch {
      process.stderr.write(`Warning: could not remove temporary branch ${bootstrapBranchName}\n`);
    }
  }
}

if (publicationError) {
  fail(`publication failed: ${publicationError.stderr?.toString().trim() || publicationError.message}`);
}
