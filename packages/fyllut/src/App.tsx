import { AppThemeProvider, makeStyles, Styles } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router';
import { FormNotFoundPage } from './components/errors/FormNotFoundPage';
import { InternalServerErrorPage } from './components/errors/InternalServerErrorPage';
import SessionExpiredPage from './components/errors/SessionExpiredPage';
import FormPageWrapper from './components/form/FormPageWrapper';
import { FormsPage } from './components/forms/FormsPage';

const useStyles = makeStyles({
  '@global': Styles.global,
  app: {
    margin: '0 auto',
  },
});

const App = () => {
  const styles = useStyles();

  return (
    <main className={styles.app}>
      <AppThemeProvider>
        <Routes>
          <Route path="/" element={<FormsPage />} />
          <Route path="/500" element={<InternalServerErrorPage />} />
          <Route path="/soknad-ikke-funnet" element={<FormNotFoundPage />} />
          <Route path="/sesjon-utlopt" element={<SessionExpiredPage />} />
          <Route path="/:formPath/*" element={<FormPageWrapper />} />
        </Routes>
      </AppThemeProvider>
    </main>
  );
};

export default App;
