import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fail } from './errors.mjs';

const collectGeneratedArtifacts = ({ plan, planDirectory, outputDirectory }) => {
  const reservedArtifactPaths = new Set(
    ['index.html', 'test-plan.pdf', 'github-issue.md', 'internal-instructions.md', 'manifest.json'].map((path) =>
      path.toLowerCase(),
    ),
  );
  const generatedArtifacts = [];
  const generatedArtifactPaths = new Set();

  for (const form of plan.forms.filter((entry) => entry.kind === 'generated' && entry.artifact)) {
    if (typeof form.artifact !== 'string' || !form.artifact.trim()) {
      fail('generated form artifact must be a non-empty relative path');
    }
    if (isAbsolute(form.artifact)) {
      fail(`generated form artifact must be relative: ${form.artifact}`);
    }
    const sourcePath = resolve(planDirectory, form.artifact);
    const destinationPath = resolve(outputDirectory, form.artifact);
    const normalizedDestination = relative(outputDirectory, destinationPath).replaceAll('\\', '/');
    const comparableDestination = normalizedDestination.toLowerCase();
    if (!normalizedDestination || normalizedDestination.startsWith('..')) {
      fail(`generated form artifact escapes the output directory: ${form.artifact}`);
    }
    if (reservedArtifactPaths.has(comparableDestination) || generatedArtifactPaths.has(comparableDestination)) {
      fail(`generated form artifact has a reserved or duplicate destination: ${form.artifact}`);
    }
    if (!existsSync(sourcePath)) {
      fail(`generated form artifact does not exist: ${sourcePath}`);
    }
    if (lstatSync(sourcePath).isSymbolicLink()) {
      fail(`generated form artifact cannot be a symbolic link: ${sourcePath}`);
    }
    if (!lstatSync(sourcePath).isFile()) {
      fail(`generated form artifact must be a file: ${sourcePath}`);
    }
    const canonicalSource = realpathSync(sourcePath);
    const canonicalPlanDirectory = realpathSync(planDirectory);
    if (canonicalSource !== canonicalPlanDirectory && !canonicalSource.startsWith(`${canonicalPlanDirectory}${sep}`)) {
      fail(`generated form artifact resolves outside the plan directory: ${sourcePath}`);
    }
    generatedArtifactPaths.add(comparableDestination);
    generatedArtifacts.push({ sourcePath, destinationPath, artifact: normalizedDestination });
  }
  return generatedArtifacts;
};

const writeArtifacts = ({ plan, outputDirectory, artifactFiles, generatedArtifacts, generatedAt }) => {
  mkdirSync(outputDirectory, { recursive: true });

  const desiredArtifactPaths = new Set([
    ...artifactFiles.keys(),
    ...generatedArtifacts.map(({ artifact }) => artifact),
    'manifest.json',
  ]);
  const previousManifestPath = join(outputDirectory, 'manifest.json');
  if (readdirSync(outputDirectory).length > 0 && !existsSync(previousManifestPath)) {
    fail('output directory is not empty and has no artifact manifest');
  }
  if (existsSync(previousManifestPath) && lstatSync(previousManifestPath).isFile()) {
    try {
      const previousManifest = JSON.parse(readFileSync(previousManifestPath, 'utf8'));
      if (
        !previousManifest ||
        !(previousManifest.manifestVersion === 1 || previousManifest.schemaVersion === 3) ||
        !Array.isArray(previousManifest.files) ||
        previousManifest.files.length === 0
      ) {
        throw new Error('manifest must contain a supported manifestVersion and a non-empty files array');
      }
      if (
        previousManifest.files.some((entry) => entry?.path === 'test-plan.pdf') &&
        existsSync(join(outputDirectory, 'test-plan.pdf'))
      ) {
        throw new Error(
          'previous PDF is tracked by the old renderer; move it outside the output directory before rerendering',
        );
      }
      const previousPaths = new Set();
      for (const entry of previousManifest.files) {
        if (
          !entry ||
          typeof entry.path !== 'string' ||
          !entry.path ||
          typeof entry.sha256 !== 'string' ||
          !/^[0-9a-f]{64}$/.test(entry.sha256) ||
          isAbsolute(entry.path) ||
          entry.path.split(/[\\/]/).some((part) => !part || part === '.' || part === '..') ||
          previousPaths.has(entry.path)
        ) {
          throw new Error('manifest contains an invalid file entry');
        }
        previousPaths.add(entry.path);
        if (desiredArtifactPaths.has(entry.path)) {
          continue;
        }
        const previousArtifact = resolve(outputDirectory, entry.path);
        const relativePath = relative(outputDirectory, previousArtifact);
        if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
          rmSync(previousArtifact, { force: true });
        }
      }
    } catch (error) {
      fail(`could not read the previous artifact manifest: ${error.message}`);
    }
  }

  for (const [name, content] of artifactFiles) {
    writeFileSync(join(outputDirectory, name), content);
  }

  for (const { sourcePath, destinationPath } of generatedArtifacts) {
    mkdirSync(dirname(destinationPath), { recursive: true });
    if (sourcePath !== destinationPath) {
      copyFileSync(sourcePath, destinationPath);
    }
  }

  const manifestEntries = [];
  for (const name of artifactFiles.keys()) {
    const content = readFileSync(join(outputDirectory, name));
    manifestEntries.push({
      path: name,
      sha256: createHash('sha256').update(content).digest('hex'),
    });
  }
  for (const { artifact } of generatedArtifacts) {
    const content = readFileSync(resolve(outputDirectory, artifact));
    manifestEntries.push({
      path: artifact,
      sha256: createHash('sha256').update(content).digest('hex'),
    });
  }

  writeFileSync(
    join(outputDirectory, 'manifest.json'),
    `${JSON.stringify({ manifestVersion: 1, slug: plan.slug, generatedAt, files: manifestEntries }, null, 2)}\n`,
  );
};

export { collectGeneratedArtifacts, writeArtifacts };
