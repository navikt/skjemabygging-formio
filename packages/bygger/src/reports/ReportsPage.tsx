import { Alert } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { ReportDefinition } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import RowLayout from '../components/layout/RowLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import { useAuth } from '../context/auth-context';

const ReportsPage = () => {
  const { userData } = useAuth();
  const { config, http } = useAppConfig();
  const [reports, setReports] = useState<ReportDefinition[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const reportUrlPrefix = config?.isDevelopment ? 'http://localhost:8080' : '';

  useEffect(() => {
    if (userData?.isAdmin) {
      http
        ?.get<ReportDefinition[]>('/api/reports')
        .then((list) => setReports(list))
        .catch(() => setErrorMessage('Henting av rapportoversikt feilet'));
    }
  }, [http, userData]);

  return (
    <AppLayout>
      <TitleRowLayout>
        <Title>Rapporter</Title>
      </TitleRowLayout>

      <RowLayout>
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
        {userData?.isAdmin ? (
          <div>
            <p id="first-publication-notice">
              Kolonnen «første publiseringsdato» i «Alle skjema med nøkkelinformasjon» er foreløpig tom. Datoen avventer
              støtte i forms-api og er ikke det samme som sist publisert.
            </p>
            <ul>
              {reports?.map((report) => (
                <li key={report.id}>
                  <a
                    href={`${reportUrlPrefix}/api/reports/${report.id}`}
                    aria-describedby={report.id === 'all-forms-summary' ? 'first-publication-notice' : undefined}
                  >
                    {report.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>Du er ikke autorisert til å ta ut rapporter</div>
        )}
      </RowLayout>
    </AppLayout>
  );
};

export default ReportsPage;
