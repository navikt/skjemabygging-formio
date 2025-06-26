import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import jsonConfig from './token-generator.config.json' with { type: 'json' };

const root = process.cwd();
const filterTag = process.argv[2] || 'bygger';

const allPossibleTags = jsonConfig
  .reduce(
    (acc, env) => {
      env.tags.forEach((tag) => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    },
    ['all'],
  )
  .sort();

const wrapItalics = (text) => `\x1b[3m${text}\x1b[0m`;

// print usage and exit
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node token-generator.mjs [filterTag]');
  console.log('Generates or updates access tokens in environment files based on the provided filter tag.');
  console.log('Use "all" to process all environments. If no filter tag is provided, it defaults to "bygger".');
  console.log(`\u2022 tags: ${allPossibleTags.map(wrapItalics).join(', ')}`);
  process.exit(0);
}

const COLOR_GREEN = '\x1b[32m';
const COLOR_ORANGE = '\x1b[33m';
const COLOR_RESET = '\x1b[0m';

const ICON_CHECK = '\u2705';
const ICON_ERROR = '\u274C';

function readLineFromStdin() {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, terminal: true });
    rl.on('line', (line) => {
      resolve(line.trim());
      rl.close();
    });
  });
}

function getExp(accessToken) {
  try {
    const [, payload] = accessToken.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    const expiryTimestamp = decodedPayload.exp;
    return new Date(expiryTimestamp * 1000).toISOString();
  } catch (_err) {
    return undefined;
  }
}

for (const env of jsonConfig) {
  if (filterTag !== 'all' && !env.tags.includes(filterTag)) {
    continue;
  }
  process.stdout.write(`Visit ${env.url}\n`);
  process.stdout.write(`${COLOR_ORANGE}Paste access_token:${COLOR_RESET} `);
  const accessToken = await readLineFromStdin();
  const expiresAt = getExp(accessToken);
  if (!expiresAt) {
    process.stdout.write(`${env.name} ${ICON_ERROR} invalid token\n\n`);
    continue;
  }

  const envContent = fs.readFileSync(path.join(root, env.filePath), { encoding: 'utf-8', flag: 'r' });
  const lines = envContent.split('\n');
  const tokenLine = `${env.name}=${accessToken}`;
  let tokenLineReplaced = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const currentLineContainsToken = lines[lineIndex].includes(`${env.name}=`);
    if (currentLineContainsToken) {
      if (!tokenLineReplaced) {
        // Replace line with correct token
        lines[lineIndex] = tokenLine;
        tokenLineReplaced = true;
      } else if (!lines[lineIndex].startsWith('#')) {
        // Comment out any additional lines containing token if the token has already been replaced
        lines[lineIndex] = `#${lines[lineIndex]}`;
      }
    }
  }

  if (!tokenLineReplaced) {
    // Add line with token if it did not exist
    lines.push(tokenLine);
  }

  process.stdout.write(`${env.name} ${ICON_CHECK} (expires at ${expiresAt})\n`);

  const newEnvContent = lines.join('\n');
  fs.writeFileSync(path.join(root, env.filePath), newEnvContent);
  process.stdout.write('\n');
}

process.stdout.write(`${COLOR_GREEN}Token ready, remember to restart dev server${COLOR_RESET} \n`);
