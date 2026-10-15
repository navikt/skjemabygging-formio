import { createServer } from '@mocks-server/main';
import { activeEvidence } from './utils/playwrightEvidence';

const core = createServer({
  config: {
    readArguments: true,
    readEnvironment: true,
    readFile: true,
  },
  files: {
    enabled: true,
  },
});

const start = async () => {
  await core.init();
  if (activeEvidence) core.server.addRouter('/__playwright', activeEvidence.control);
  await core.start();
  console.log('\nMocks server started');
};
start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
