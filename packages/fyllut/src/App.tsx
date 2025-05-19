import '@navikt/ds-css';
import { makeStyles, Styles } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router-dom';
import { ErrorPageWrapper } from './components/errors/ErrorPageWrapper';
import { FormNotFoundPage } from './components/errors/FormNotFound';
import { InternalServerErrorPage } from './components/errors/InternalServerErrorPage';
import { FormPageWrapper } from './components/form/FormPageWrapper';
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
      <Routes>
        <Route path="/" element={<FormsPage />} />
        <Route
          path="/500"
          element={
            <ErrorPageWrapper>
              <InternalServerErrorPage />
            </ErrorPageWrapper>
          }
        />
        <Route
          path="/soknad-ikke-funnet"
          element={
            <ErrorPageWrapper>
              <FormNotFoundPage />
            </ErrorPageWrapper>
          }
        />
        <Route path="/:formPath/*" element={<FormPageWrapper />} />
      </Routes>
    </main>
  );
};

export default App;
