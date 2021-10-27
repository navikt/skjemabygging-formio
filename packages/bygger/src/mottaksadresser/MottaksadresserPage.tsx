import React from "react";
import {AppLayoutWithContext} from "../components/AppLayout";
import Row from "../components/layout/Row";
import MottaksadresserListe from "./MottaksadresserListe";

const MottaksadresserPage = () => {

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Mottaksadresser",
        visOversettelseliste: false,
        visSkjemaliste: true,
      }}
    >
      <Row>
        <MottaksadresserListe />
      </Row>
    </AppLayoutWithContext>
  );
}

export default MottaksadresserPage;
