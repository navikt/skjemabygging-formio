import '@navikt/ds-css';
import { makeStyles, Styles } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router-dom';
import { ErrorPageWrapper } from './components/errors/ErrorPageWrapper';
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
        <Route path="/500" element={<ErrorPageWrapper statusCode={500} />} />
        <Route path="/:formPath/*" element={<FormPageWrapper />} />
      </Routes>
    </main>
  );
};

export default App;
