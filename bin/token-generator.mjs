import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import jsonConfig from './token-generator.config.json' with { type: 'json' };

const root = process.cwd();

const COLOR_GREEN = '\x1b[32m';
const COLOR_ORANGE = '\x1b[33m';
const COLOR_RESET = '\x1b[0m';

const ICON_CLOCK = '\u23F0';

function readLineFromStdin() {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin });
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
    return '<unknown>';
  }
}

for (const env of jsonConfig) {
  process.stdout.write(`Visit ${env.url}\n`);
  process.stdout.write(`${COLOR_ORANGE}Paste access_token:${COLOR_RESET} `);
  const accessToken = await readLineFromStdin();

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

  process.stdout.write(`• Token ${env.name} expires at ${getExp(accessToken)} ${ICON_CLOCK} \n`);

  const newEnvContent = lines.join('\n');
  fs.writeFileSync(path.join(root, env.filePath), newEnvContent);
}

process.stdout.write(`${COLOR_GREEN}Token ready, remember to restart dev server${COLOR_RESET} \n`);
