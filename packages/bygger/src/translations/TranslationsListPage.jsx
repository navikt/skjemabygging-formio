import { makeStyles } from "@material-ui/styles";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { FormsList } from "../Forms/FormsListPage";
import { asFormMetadata } from "../Forms/formsListUtils";
import FormStatus from "../Forms/status/FormStatus";

const useTranslationsListStyles = makeStyles({
  root: {
    maxWidth: "50rem",
    margin: "0 auto 2rem",
  },
  list: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    padding: "0.3rem 0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(5rem,10rem) auto 8rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
  globalListItem: {
    padding: "0.3rem 0.5rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
});

export function TranslationsListPage({ loadFormsList }) {
  const classes = useTranslationsListStyles();
  const [forms, setForms] = useState();
  const [status, setStatus] = useState("LOADING");

  useEffect(() => {
    loadFormsList().then((forms) => {
      setForms(forms);
      setStatus("FINISHED LOADING");
    });
  }, [loadFormsList]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  return (
    <AppLayout
      navBarProps={{
        title: "Oversettelser",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
      }}
    >
      <main className={classes.root}>
        <nav className="margin-bottom-double">
          <Innholdstittel className="margin-bottom-default">Globale oversettelser</Innholdstittel>
          <ul className={classes.list}>
            <li className={classes.globalListItem}>
              <Link to="/translations/global/nn-NO/skjematekster">Felles oversettelser for alle skjemaer</Link>
            </li>
          </ul>
        </nav>
        <nav className="margin-bottom-large">
          <Innholdstittel className="margin-bottom-default">Skjemaliste</Innholdstittel>
          {!forms ? (
            <p>Finner ingen skjemaer...</p>
          ) : (
            <FormsList className={classes.list} formMetadataList={forms?.map(asFormMetadata)}>
              {(formMetadata) => (
                <li className={classes.listItem} key={formMetadata.path}>
                  <Link className="lenke" data-testid="editLink" to={`/translations/${formMetadata.path}`}>
                    {formMetadata.skjemanummer}
                  </Link>
                  <Link className="lenke" data-testid="editLink" to={`/translations/${formMetadata.path}`}>
                    {formMetadata.title}
                  </Link>
                  <FormStatus status={formMetadata.status} size={"small"} />
                </li>
              )}
            </FormsList>
          )}
        </nav>
      </main>
    </AppLayout>
  );
}
