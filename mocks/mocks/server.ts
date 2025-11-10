import { createServer } from '@mocks-server/main';

const server = createServer({
  config: {
    readArguments: true,
    readEnvironment: true,
    readFile: true,
  },
  files: {
    enabled: true,
  },
});

server.start().then(async () => {
  console.log('\nMocks server started');
});
