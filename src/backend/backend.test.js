import {Backend} from "./index.js";

describe('Backend', () => {
  it('clones the repo to the disk', async () => {
    const workingFolder = '/tmp/publishingBackend';
    const gitUri = 'git@github.com:navikt/skjemapublisering-test.git';
    console.log(Backend);
    const backend = new Backend(workingFolder, gitUri);
    await backend.cloneRepo();
  });
});
