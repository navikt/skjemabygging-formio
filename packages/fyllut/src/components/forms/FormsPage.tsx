import { LoadingComponent, makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsResponseForm } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import httpFyllut from '../../util/httpFyllut';
import FormsPageRow from './FormsPageRow';

const useStyles = makeStyles({
  maxContentWidth: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  skjemaliste: {
    borderCollapse: 'collapse',
  },
});

export const FormsPage = () => {
  const [status, setStatus] = useState('LOADING');
  const [forms, setForms] = useState<FormsResponseForm[]>([]);
  const [searchParams] = useSearchParams();
  const styles = useStyles();
  const { config, baseUrl } = useAppConfig();

  const isDevelopment = config && config.isDevelopment;

  useEffect(() => {
    const formId = searchParams.get('form');
    if (formId) {
      window.location.replace(`${baseUrl}/${formId}`);
    } else {
      httpFyllut
        .get<FormsResponseForm[]>(`/fyllut/api/forms`)
        .then((forms) => {
          setForms(forms);
          setStatus('FINISHED LOADING');
        })
        .catch(() => {
          setStatus('FORMS NOT FOUND');
        });
    }
  }, [history, baseUrl]);

  if (status === 'LOADING') {
    return <LoadingComponent />;
  }

  if (status === 'FORMS NOT FOUND' || forms.length === 0) {
    return <h1>Finner ingen skjemaer</h1>;
  }

  return (
    <section className={styles.maxContentWidth}>
      <h1>Velg et skjema</h1>
      <nav>
        <table className={styles.skjemaliste}>
          {isDevelopment && (
            <thead>
              <tr>
                <th>Skjemanummer</th>
                <th>Skjematittel</th>
                <th colSpan={4}>Innsending</th>
              </tr>
            </thead>
          )}
          <tbody>
            {forms
              .sort((a, b) => (a.modified! < b.modified! ? 1 : -1))
              .map((form) => (
                <FormsPageRow key={form._id} form={form} />
              ))}
          </tbody>
        </table>
      </nav>
    </section>
  );
};
