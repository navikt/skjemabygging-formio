import '@navikt/ds-css';
import { makeStyles, Styles } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router';
import { FormNotFoundPage } from './components/errors/FormNotFoundPage';
import { InternalServerErrorPage } from './components/errors/InternalServerErrorPage';
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
      <Routes>
        <Route path="/" element={<FormsPage />} />
        <Route path="/500" element={<InternalServerErrorPage />} />
        <Route path="/soknad-ikke-funnet" element={<FormNotFoundPage />} />
        <Route path="/:formPath">
          <Route path="*" element={<FormPageWrapper />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
