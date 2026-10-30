import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { onTestFinished } from 'vitest';
import { createFyllutServerConfig } from '../../../bin/fyllut-server-config.mjs';
import tokenConfig from '../../../bin/token-generator.config.json';

const script = fileURLToPath(new URL('../../../bin/token-generator.mjs', import.meta.url));
const proxyTokenName = 'SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN';
const createToken = (id: string | number) =>
  `synthetic.${Buffer.from(JSON.stringify({ exp: 4102444800, id })).toString('base64url')}.signature`;

const runGenerator = (cwd: string, tag: string, tokens: string[]) =>
  new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [script, tag], { cwd, stdio: 'pipe' });
    onTestFinished(() => {
      child.kill();
    });
    let stdout = '';
    let stderr = '';
    let promptsAnswered = 0;
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      const prompts = stdout.match(/Paste access_token:/g)?.length ?? 0;
      while (promptsAnswered < prompts && promptsAnswered < tokens.length) {
        child.stdin.write(`${tokens[promptsAnswered++]}\n`);
        if (promptsAnswered === tokens.length) {
          child.stdin.end();
        }
      }
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });

const createWorkspace = () => {
  const root = mkdtempSync(join(tmpdir(), 'fyllut-token-generator-'));
  const backend = join(root, 'packages/fyllut-backend');
  mkdirSync(backend, { recursive: true });
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  return { root, envPath: join(backend, '.env') };
};

describe('mock server environment', () => {
  it.each([
    { mode: 'dev', testMode: false },
    { mode: 'dev', testMode: true },
    { mode: 'built', testMode: false },
    { mode: 'built', testMode: true },
  ] as const)('clears inherited proxy tokens in $mode mode with testMode=$testMode', ({ mode, testMode }) => {
    const { commands } = createFyllutServerConfig({
      repoRoot: process.cwd(),
      ports: [3000, 3001, 3002, 3003],
      mode,
      testMode,
    });
    const backendEnv: Record<string, string> = {
      SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN: 'synthetic-inherited-token',
      ...commands[1][2],
    };

    expect(backendEnv.SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN).toBe('');
    expect(backendEnv.MOCKS_ENABLED).toBe('true');
  });
});

describe('token generator', () => {
  it('selects Fyllut tokens and creates a private environment file', async () => {
    const { root, envPath } = createWorkspace();
    const targets = tokenConfig.filter(({ tags }) => tags.includes('fyllut'));
    const tokens = targets.map((_, index) => createToken(index));

    const { code, stdout, stderr } = await runGenerator(root, 'fyllut', tokens);

    expect(stderr).toBe('');
    expect(code).toBe(0);
    const content = readFileSync(envPath, 'utf8');
    for (const [index, target] of targets.entries()) {
      expect(content).toContain(`${target.name}=${tokens[index]}`);
    }
    expect(content).toContain(`${proxyTokenName}=`);
    expect(stdout).toContain(
      'https://azure-token-generator.intern.dev.nav.no/api/m2m?aud=dev-fss:skjemadigitalisering:skjemabygging-proxy',
    );
    expect(stdout).not.toContain('FORMS_API_ACCESS_TOKEN');
    expect(statSync(envPath).mode & 0o777).toBe(0o600);
  });

  it('replaces the proxy token and preserves unrelated settings', async () => {
    const { root, envPath } = createWorkspace();
    writeFileSync(envPath, `# Local configuration\nOTHER_SETTING=keep-me\n${proxyTokenName}=old-token\n`, {
      mode: 0o600,
    });
    const token = createToken('replacement');

    const { code, stdout, stderr } = await runGenerator(root, 'skjemabygging-proxy', [token]);

    expect(stderr).toBe('');
    expect(code).toBe(0);
    expect(readFileSync(envPath, 'utf8')).toBe(
      `# Local configuration\nOTHER_SETTING=keep-me\n${proxyTokenName}=${token}\n`,
    );
    expect(stdout).toContain(`${proxyTokenName} \u2705`);
    expect(stdout).not.toContain('INNSENDING_API_M2M_ACCESS_TOKEN');
  });

  it('does not report success when writing the environment file fails', async () => {
    const { root, envPath } = createWorkspace();
    writeFileSync(envPath, 'OTHER_SETTING=keep-me\n', { mode: 0o400 });

    const { code, stdout, stderr } = await runGenerator(root, 'skjemabygging-proxy', [createToken('write-failure')]);

    expect(stderr).toContain('EACCES');
    expect(code).not.toBe(0);
    expect(stdout).not.toContain('\u2705');
    expect(stdout).not.toContain('Token ready');
    expect(readFileSync(envPath, 'utf8')).toBe('OTHER_SETTING=keep-me\n');
  });
});
