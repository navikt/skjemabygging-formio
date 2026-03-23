import { render, screen } from '@testing-library/react';
import { SharedFrontendBoundary, sharedFrontendPackageName } from './index';

describe('shared-frontend package', () => {
  it('exports the package name', () => {
    expect(sharedFrontendPackageName).toBe('@navikt/skjemadigitalisering-shared-frontend');
  });

  it('renders children through the placeholder boundary', () => {
    render(
      <SharedFrontendBoundary>
        <span>Shared frontend is ready</span>
      </SharedFrontendBoundary>,
    );

    expect(screen.getByText('Shared frontend is ready')).toBeDefined();
  });
});
