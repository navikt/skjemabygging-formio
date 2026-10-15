import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { validatePorts } from '../lib/test-ports.mjs';
import { checkBuild } from './test-epoch.mjs';

const repoRoot = realpathSync(resolve(import.meta.dirname, '../..'));
const withinRoot = (path) => {
  const absolute = resolve(path);
  const child = relative(repoRoot, absolute);
  if (!child || child === '..' || child.startsWith(`..${sep}`) || isAbsolute(child))
    throw new Error('EXISTING_PATH_OUTSIDE_WORKTREE');
  return absolute;
};
const fingerprint = (mode) => {
  const hash = createHash('sha256');
  const git = (args) => execFileSync('git', args, { cwd: repoRoot });
  hash.update(git(['rev-parse', 'HEAD']));
  hash.update(git(['diff', 'HEAD', '--']));
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z']).toString().split('\0').filter(Boolean);
  const includeFile = (path) =>
    hash.update(
      JSON.stringify([relative(repoRoot, path), createHash('sha256').update(readFileSync(path)).digest('hex')]),
    );
  for (const path of untracked.sort()) includeFile(resolve(repoRoot, path));
  for (const path of checkBuild(mode)) includeFile(path);
  return hash.digest('hex');
};
const saveExistingManifest = (path, manifest) => {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, JSON.stringify(manifest, null, 2), { flag: 'wx', mode: 0o600 });
  renameSync(temporary, path);
};
const loadExistingManifest = (path) => {
  const manifest = JSON.parse(readFileSync(withinRoot(realpathSync(withinRoot(path))), 'utf8'));
  if (manifest?.protocol !== 1 || manifest.repoRoot !== repoRoot) throw new Error('EXISTING_WRONG_WORKTREE');
  if (manifest.state !== 'ready') throw new Error(`EXISTING_NOT_AVAILABLE: ${manifest.state}`);
  if (!Number.isFinite(Date.parse(manifest.expiresAt)) || Date.parse(manifest.expiresAt) <= Date.now())
    throw new Error('EXISTING_EXPIRED');
  if (typeof manifest.claimToken !== 'string' || !/^[a-f0-9]{64}$/.test(manifest.claimToken))
    throw new Error('EXISTING_INVALID_TOKEN');
  if (typeof manifest.socketPath !== 'string') throw new Error('EXISTING_INVALID_SOCKET');
  if (!Number.isInteger(manifest.controllerPid) || manifest.controllerPid <= 0)
    throw new Error('EXISTING_INVALID_CONTROLLER');
  if (process.platform === 'win32') {
    if (!/^\\\\\.\\pipe\\fyllut-playwright-[a-f0-9]+$/.test(manifest.socketPath))
      throw new Error('EXISTING_INVALID_SOCKET');
  } else withinRoot(manifest.socketPath);
  const epoch = manifest.epoch;
  if (
    !epoch ||
    !['dev', 'built'].includes(epoch.mode) ||
    epoch.state !== 'ready' ||
    epoch.attempt !== 0 ||
    epoch.repoRoot !== repoRoot ||
    typeof epoch.epochId !== 'string' ||
    !/^[a-f0-9-]{36}$/.test(epoch.epochId) ||
    !/^F\d{3}-T\d{3}(?:-C\d{3})?$/.test(epoch.testId) ||
    !Number.isInteger(epoch.ownerPid) ||
    epoch.ownerPid <= 0 ||
    !Array.isArray(epoch.pids) ||
    !epoch.pids.length ||
    !epoch.pids.every((pid) => Number.isInteger(pid) && pid > 0)
  )
    throw new Error('EXISTING_INVALID_EPOCH');
  validatePorts(epoch.ports);
  const origin = (port) => `http://127.0.0.1:${port}`;
  if (
    epoch.mockURL !== origin(epoch.ports[0]) ||
    epoch.adminURL !== origin(epoch.ports[1]) ||
    epoch.backendURL !== origin(epoch.ports[2]) ||
    epoch.baseURL !== origin(epoch.ports[epoch.mode === 'built' ? 2 : 3])
  )
    throw new Error('EXISTING_INVALID_ORIGIN');
  if (manifest.fingerprint !== fingerprint(epoch.mode)) throw new Error('EXISTING_SOURCE_CHANGED');
  return manifest;
};

export { fingerprint, loadExistingManifest, repoRoot, saveExistingManifest, withinRoot };
