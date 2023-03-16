import { makeStyles } from "@material-ui/styles";
import { Heading } from "@navikt/ds-react";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { ReportDefinition } from "@navikt/skjemadigitalisering-shared-domain";
import AlertStripe from "nav-frontend-alertstriper";
import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import { useAuth } from "../context/auth-context";

const useStyles = makeStyles({
  reports: {
    gridColumn: "2 / 3",
  },
});

const ReportsPage = () => {
  const styles = useStyles();
  const { userData } = useAuth();
  const { config, http } = useAppConfig();
  const [reports, setReports] = useState<ReportDefinition[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const reportUrlPrefix = config?.isDevelopment ? "http://localhost:8080" : "";

  useEffect(() => {
    if (userData?.isAdmin) {
      http
        ?.get<ReportDefinition[]>("/api/reports")
        .then((list) => setReports(list))
        .catch(() => setErrorMessage("Henting av rapportoversikt feilet"));
    }
  }, [http, userData]);

  return (
    <AppLayout navBarProps={{}}>
      <Row>
        <Column className={styles.reports}>
          <Heading level="1" size="xlarge">
            Rapporter
          </Heading>
          {errorMessage && <AlertStripe type={"feil"}>{errorMessage}</AlertStripe>}
          {userData?.isAdmin ? (
            <div>
              <ul>
                {reports?.map((report) => (
                  <li key={report.id}>
                    <a href={`${reportUrlPrefix}/api/reports/${report.id}`} target="_blank" rel="noreferrer">
                      {report.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>Du er ikke autorisert til å ta ut rapporter</div>
          )}
        </Column>
      </Row>
    </AppLayout>
  );
};

export default ReportsPage;
