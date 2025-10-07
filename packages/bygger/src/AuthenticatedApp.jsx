import { Navigate, Route, Routes } from 'react-router';
import GlobalTranslationsProvider from './context/translations/GlobalTranslationsContext';
import { FormsRouter } from './Forms';
import ImportFormsPage from './import/ImportFormsPage';
import BulkPublishPage from './migration/BulkPublishPage';
import MigrationRouter from './migration/MigrationRouter';
import RecipientsPage from './recipients/RecipientsPage';
import ReportsPage from './reports/ReportsPage';
import GlobalTranslationsPage from './translations/global/GlobalTranslationsPage';

function AuthenticatedApp({ serverURL }) {
  return (
    <>
      <Routes>
        <Route path="/forms/*" element={<FormsRouter serverURL={serverURL} />} />
        <Route path="/oversettelser" element={<Navigate to="/oversettelser/skjematekster" replace />} />
        <Route
          path="/oversettelser/:tag"
          element={
            <GlobalTranslationsProvider>
              <GlobalTranslationsPage serverURL={serverURL} />
            </GlobalTranslationsProvider>
          }
        />
        <Route path="/import/skjema" element={<ImportFormsPage />} />
        <Route path="/mottakere" element={<RecipientsPage />} />
        <Route path="/migrering/*" element={<MigrationRouter />} />
        <Route path="/bulk-publisering" element={<BulkPublishPage />} />
        <Route path="/rapporter" element={<ReportsPage />} />
        <Route path="/" element={<Navigate to="/forms" replace />} />
      </Routes>
    </>
  );
}

export default AuthenticatedApp;
