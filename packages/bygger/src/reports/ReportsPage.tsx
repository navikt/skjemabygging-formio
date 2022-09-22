import { makeStyles } from "@material-ui/styles";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import { useAuth } from "../context/auth-context";

const useStyles = makeStyles({
  reports: {
    gridColumn: "2 / 3",
  },
});

type Report = {
  id: string;
  title: string;
};

const ReportsPage = () => {
  const styles = useStyles();
  const { userData } = useAuth();
  const { config, http } = useAppConfig();
  const [reports, setReports] = useState<Report[] | undefined>(undefined);

  useEffect(() => {
    http?.get<Report[]>("/api/reports").then((list) => setReports(list));
  }, [http]);

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rapporter",
        visSkjemaliste: true,
      }}
    >
      <Row>
        <Column className={styles.reports}>
          {userData?.isAdmin || config?.isDevelopment ? (
            <div>
              <ul>
                {reports?.map((report) => (
                  <li key={report.id}>
                    <a href={`/api/reports/${report.id}`} target="_blank" rel="noreferrer">
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
    </AppLayoutWithContext>
  );
};

export default ReportsPage;
