import { sendinnEntryUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { UnavailablePage } from '../app/error/UnavailablePage';
import { JourneyPlaceholder } from './JourneyPlaceholder';

// Expects a router with basename /sendinn, so the pathname is relative to the sendinn base path.
const SendinnRoutes = () => {
  const { pathname, search } = useLocation();
  const entry = useMemo(
    () => sendinnEntryUtils.resolveEntry(pathname, new URLSearchParams(search)),
    [pathname, search],
  );

  if (entry.journey === 'unavailable') {
    return <UnavailablePage />;
  }

  return <JourneyPlaceholder journey={entry.journey} />;
};

export { SendinnRoutes };
