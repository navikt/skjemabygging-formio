import React from "react";
import { useHistory } from "react-router-dom";
import { SletteKnapp } from "../Forms/components";
import { AppLayoutWithContext } from "../components/AppLayout";

const TranslationsByFormPage = ({ deleteLanguage, form, resourceId }) => {
  const history = useHistory();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rediger oversettelse",
        visSkjemaliste: false,
        visLagNyttSkjema: false,
        visOversettelseliste: true,
      }}
      rightCol={
        <SletteKnapp
          className="lenke"
          onClick={() => deleteLanguage(resourceId).then(() => history.push("/translations"))}
        >
          Slett oversettelser
        </SletteKnapp>
      }
    >
      <h1>Hello World!</h1>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </AppLayoutWithContext>
  );
};

export default TranslationsByFormPage;
