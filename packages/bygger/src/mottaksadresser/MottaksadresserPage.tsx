import { Sidetittel } from "nav-frontend-typografi";
import React from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import Row from "../components/layout/Row";
import MottaksadresserListe from "./MottaksadresserListe";

const MottaksadresserPage = () => {
  return (
    <AppLayoutWithContext
      navBarProps={{
        visOversettelseliste: false,
        visSkjemaliste: true,
      }}
    >
      <Sidetittel className="margin-bottom-double">Mottaksadresser</Sidetittel>
      <Row>
        <MottaksadresserListe />
      </Row>
    </AppLayoutWithContext>
  );
};

export default MottaksadresserPage;
