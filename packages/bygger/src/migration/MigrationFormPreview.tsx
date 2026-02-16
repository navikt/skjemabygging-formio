import { XMarkIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import {
  ErrorPage,
  FyllUtRouter,
  LanguagesProvider,
  LoadingComponent,
  makeStyles,
  Styles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

const useStyles = makeStyles({
  '@global': Styles.global,
  backContainer: {
    maxWidth: '800px',
    margin: '0 auto 1rem auto',
  },
});

const MigrationFormPreview = () => {
  const [form, setForm] = useState();
  const [error, setError] = useState<string>();
  const { formPath } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();

  const styles = useStyles();
  useEffect(() => {
    try {
      fetch(`/api/migrate/preview/${formPath}${search}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      }).then((response) => response.json().then(setForm));
    } catch (err: any) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(err instanceof Error ? (err as Error).message : 'Noe galt skjedde da vi prøvde å laste skjemaet');
    }
  }, [formPath, search]);

  if (!form && !error) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorPage errorMessage={error} />;
  }

  return (
    <div>
      <div className={styles.backContainer}>
        <Button variant="tertiary" icon={<XMarkIcon aria-hidden />} onClick={() => navigate(-1)} type="button">
          Tilbake
        </Button>
      </div>
      <LanguagesProvider translations={{}}>
        <FyllUtRouter form={form!} />
      </LanguagesProvider>
    </div>
  );
};

export default MigrationFormPreview;
