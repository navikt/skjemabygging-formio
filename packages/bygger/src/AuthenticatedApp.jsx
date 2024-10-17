import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FormsRouter } from './Forms';
import ImportFormsPage from './import/ImportFormsPage';
import BulkPublishPage from './migration/BulkPublishPage';
import MigrationRouter from './migration/MigrationRouter';
import MottaksadresserPage from './mottaksadresser/MottaksadresserPage';
import RecipientsPage from './recipients/RecipientsPage';
import ReportsPage from './reports/ReportsPage';
import TranslationsRouter from './translations/TranslationsRouter';

function AuthenticatedApp({ serverURL, formio }) {
  return (
    <>
      <Routes>
        <Route path="/forms/*" element={<FormsRouter formio={formio} serverURL={serverURL} />} />
        <Route path="/translations/*" element={<TranslationsRouter formio={formio} serverURL={serverURL} />} />
        <Route path="/import/skjema" element={<ImportFormsPage />} />
        <Route path="/mottaksadresser" element={<MottaksadresserPage />} />
        <Route path="/mottakere" element={<RecipientsPage />} />
        <Route path="/migrering/*" element={<MigrationRouter />} />
        <Route path="/bulk-publisering" element={<BulkPublishPage />} />
        <Route path="/rapporter" element={<ReportsPage />} />
        <Route path="/" element={<Navigate to="/forms" replace />} />
      </Routes>
    </>
  );
}

AuthenticatedApp.propTypes = {
  formio: PropTypes.object.isRequired,
};

export default AuthenticatedApp;
