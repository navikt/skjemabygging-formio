import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import Row from "../components/layout/Row";
import { useAuth } from "../context/auth-context";

const ReportsPage = () => {
  const { userData } = useAuth();
  const { config } = useAppConfig();

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rapporter",
        visSkjemaliste: true,
      }}
    >
      <Row>
        {userData?.isAdmin || config?.isDevelopment ? (
          <div>
            <a href="/api/reports/forms-published-languages" target="_blank">
              Publiserte språk per skjema
            </a>
          </div>
        ) : (
          <div>Du er ikke autorisert til å ta ut rapporter</div>
        )}
      </Row>
    </AppLayoutWithContext>
  );
};

export default ReportsPage;
