import { sendinnEntryUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { UnavailablePage } from '../app/error/UnavailablePage';
import { LoadSendinnForm } from './form/createSendinnFormService';
import { SendinnFormEntry } from './form/SendinnFormEntry';
import { JourneyPlaceholder } from './JourneyPlaceholder';

interface Props {
  loadForm: LoadSendinnForm;
  onLoadError: (error: unknown) => void;
}

// Expects a router with basename /sendinn, so the pathname is relative to the sendinn base path.
const SendinnRoutes = ({ loadForm, onLoadError }: Props) => {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const entry = sendinnEntryUtils.resolveEntry(pathname, searchParams);

  if (entry.journey === 'unavailable') {
    const notFoundPath = sendinnEntryUtils.createNotFoundPath(searchParams);
    // The backend has already answered 404 for the original URL, so the SPA only moves the user to the canonical route.
    return `${pathname}${search}` === notFoundPath ? <UnavailablePage /> : <Navigate to={notFoundPath} replace />;
  }

  if (entry.journey === 'form') {
    return (
      <Routes>
        <Route
          path="/:formPath/:step?"
          element={<SendinnFormEntry formPath={entry.formPath} loadForm={loadForm} onLoadError={onLoadError} />}
        />
      </Routes>
    );
  }

  return <JourneyPlaceholder journey={entry.journey} />;
};

export { SendinnRoutes };
