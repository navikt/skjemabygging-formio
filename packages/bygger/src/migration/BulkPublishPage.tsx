import { ErrorPage, LoadingComponent, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import { useFormioForms } from '../hooks/useFormioForms';
import BulkPublishPanel from './components/BulkPublishPanel';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    maxWidth: '80rem',
    margin: '0 auto 4rem auto',
  },
  mainContent: {
    flexDirection: 'column',
    flex: '5',
  },
  sideColumn: {
    flexDirection: 'column',
    flex: '1',
    marginLeft: '2rem',
  },
});

type Status = 'LOADING' | 'FORMS NOT FOUND' | 'FINISHED LOADING';
const BulkPublishPage = ({ formio }) => {
  const [forms, setForms] = useState<NavFormType[]>();
  const [status, setStatus] = useState<Status>('LOADING');
  const { loadFormsList } = useFormioForms(formio);
  const styles = useStyles();

  useEffect(() => {
    loadFormsList()
      .then((forms: NavFormType[]) => {
        setForms(forms);
        setStatus('FINISHED LOADING');
      })
      .catch((e) => {
        console.log(e);
        setStatus('FORMS NOT FOUND');
      });
  }, []);

  if (status === 'LOADING') {
    return <LoadingComponent />;
  }

  if (status === 'FORMS NOT FOUND') {
    return <ErrorPage errorMessage="En feil skjedde ved lasting av skjemaene" />;
  }

  return (
    <AppLayout
      navBarProps={{
        title: 'Bulkpubliser skjemaer',
        visSkjemaliste: true,
        visSkjemaMeny: false,
      }}
    >
      <main className={styles.root}>
        <Column className={styles.mainContent}>
          <BulkPublishPanel forms={forms!} />
        </Column>
        <Column className={styles.sideColumn}>
          <UserFeedback />
        </Column>
      </main>
    </AppLayout>
  );
};

export default BulkPublishPage;
