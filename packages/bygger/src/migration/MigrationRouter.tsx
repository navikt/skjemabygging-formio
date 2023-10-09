import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import MigrationFormPreview from './MigrationFormPreview';
import MigrationPage from './MigrationPage';

const MigrationRouter = () => {
  return (
    <AppLayout
      navBarProps={{
        title: 'Migrer skjema',
        visSkjemaliste: true,
        visSkjemaMeny: false,
      }}
    >
      <Routes>
        <Route path={'/forhandsvis/:formPath'} element={<MigrationFormPreview />} />
        <Route path={'/'} element={<MigrationPage />} />
      </Routes>
    </AppLayout>
  );
};

export default MigrationRouter;
