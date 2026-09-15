import { sharedFrontendPackageName } from './index';

describe('shared-frontend package', () => {
  it('exports the package name', () => {
    expect(sharedFrontendPackageName).toBe('@navikt/skjemadigitalisering-shared-frontend');
  });
});
