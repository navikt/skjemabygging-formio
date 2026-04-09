import { sharedFormPackageName } from './index';

describe('sharedFormPackageName', () => {
  it('exports the workspace package name', () => {
    expect(sharedFormPackageName).toBe('@navikt/skjemadigitalisering-shared-form');
  });
});
