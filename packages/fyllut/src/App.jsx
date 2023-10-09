import '@navikt/ds-css';
import { makeStyles, Styles } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router-dom';
import { AllForms } from './components/AllForms';
import { FormPageWrapper } from './components/FormPageWrapper';

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
        <Route path="/" element={<AllForms />} />
        <Route path="/:formPath/*" element={<FormPageWrapper />} />
      </Routes>
    </main>
  );
};

export default App;
