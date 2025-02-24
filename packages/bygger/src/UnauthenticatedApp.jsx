import { AppLayout } from './components/AppLayout';
import PageWrapper from './Forms/PageWrapper';

const UnauthenticatedApp = () => {
  return (
    <AppLayout>
      <PageWrapper>
        <div>Vennligst vent, du logges ut...</div>
      </PageWrapper>
    </AppLayout>
  );
};

export default UnauthenticatedApp;
