import { sendinnEntryUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Navigate, useLocation } from 'react-router';
import { UnavailablePage } from '../app/error/UnavailablePage';
import { JourneyPlaceholder } from './JourneyPlaceholder';

// Expects a router with basename /sendinn, so the pathname is relative to the sendinn base path.
const SendinnRoutes = () => {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const entry = sendinnEntryUtils.resolveEntry(pathname, searchParams);

  if (entry.journey === 'unavailable') {
    const notFoundPath = sendinnEntryUtils.createNotFoundPath(searchParams);
    // The backend has already answered 404 for the original URL, so the SPA only moves the user to the canonical route.
    return `${pathname}${search}` === notFoundPath ? <UnavailablePage /> : <Navigate to={notFoundPath} replace />;
  }

  return <JourneyPlaceholder journey={entry.journey} />;
};

export { SendinnRoutes };
