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
import { useEffect, useMemo, useState } from 'react';
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
  const requestUrl = useMemo(() => `/api/migrate/preview/${formPath ?? ''}${search}`, [formPath, search]);

  useEffect(() => {
    let cancelled = false;

    fetch(requestUrl, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    })
      .then(async (response) => {
        if (cancelled) return;
        const json = await response.json();
        setForm(json);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Noe galt skjedde da vi prøvde å laste skjemaet');
      });

    return () => {
      cancelled = true;
    };
  }, [requestUrl]);

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
