import { Route, Routes } from 'react-router';
import { AppLayout } from '../components/AppLayout';
import MigrationFormPreview from './MigrationFormPreview';
import MigrationPage from './MigrationPage';

const MigrationRouter = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/forhandsvis/:formPath" element={<MigrationFormPreview />} />
        <Route path="/" element={<MigrationPage />} />
      </Routes>
    </AppLayout>
  );
};

export default MigrationRouter;
