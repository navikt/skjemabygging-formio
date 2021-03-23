import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sidetittel, Undertittel } from "nav-frontend-typografi";
import { makeStyles } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";
import { SlettSkjemaKnapp } from "./components";
import { ExpandFilled, CollapseFilled } from "@navikt/ds-icons";

const FormsList = ({ forms, children }) => {
  const classes = useFormsListPageStyles();
  const [sortedForms, setSortedForms] = useState();
  const [toggle, setToggle] = useState("ascending");

  function sortFormByFormNumber(forms) {
    if (toggle === "ascending") setToggle("decending");
    else setToggle("ascending");
    setSortedForms(sortFunction(forms, "skjemanummer"));
  }

  const sortFunction = (forms, sortingKey) => forms.sort((a, b) => (a[sortingKey] < b[sortingKey] ? 1 : -1));

  return (
    <ul className={classes.list}>
      <li className={classes.listTitle}>
        <div className={classes.listTitleItem} onClick={() => sortFormByFormNumber(forms)}>
          <Undertittel>Skjemanr.</Undertittel>
          {toggle === "ascending" ? <ExpandFilled /> : <CollapseFilled />}
        </div>
        <div className={classes.listTitleItem}>
          <Undertittel>Skjematittel</Undertittel>
          {toggle === "ascending" ? <ExpandFilled /> : <CollapseFilled />}
        </div>
        <Undertittel className={classes.listTitleLastItem}>Action</Undertittel>
      </li>
      {toggle === "ascending"
        ? forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map((form) => children(form))
        : sortedForms.map((form) => children(form))}
      {/*forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map((form) => children(form))*/}
    </ul>
  );
};

/*FormsList.propTypes = {
  className: PropTypes.string,
  forms: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      title: PropTypes.string,
      tema: PropTypes.string,
      skjemanummer: PropTypes.string,
    })
  ),
};
*/
const useFormsListPageStyles = makeStyles({
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
    gridTemplateColumns: "minmax(5rem,10rem) auto minmax(5rem,10rem)",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
  listTitle: {
    padding: "0.3rem 0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(5rem,10rem) auto minmax(5rem,10rem)",
    backgroundColor: "#c1c1c1",
  },
  listTitleItem: {
    display: "flex",
    alignItems: "center",
  },
  listTitleLastItem: {
    justifySelf: "center",
  },
});

function simplifiedForms(forms) {
  return forms.map((form) => ({
    modified: form.modified,
    title: form.title,
    path: form.path,
    skjemanummer: form.properties ? (form.properties.skjemanummer ? form.properties.skjemanummer.trim() : "") : "",
    tema: form.properties ? (form.properties.tema ? form.properties.tema : "") : "",
  }));
}

export function FormsListPage({ forms, url, onDelete, onNew, onLogout }) {
  const classes = useFormsListPageStyles();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Skjemaoversikt",
        visSkjemaliste: false,
        visLagNyttSkjema: true,
        logout: onLogout,
        onNew: onNew,
      }}
    >
      <nav className={classes.root}>
        <Sidetittel className="margin-bottom-default">Velg skjema:</Sidetittel>
        <FormsList forms={simplifiedForms(forms)}>
          {(form) => (
            <li className={classes.listItem} key={form.path}>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.skjemanummer}
              </Link>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.title}
              </Link>
              <SlettSkjemaKnapp className="lenke" onClick={() => onDelete(form)}>
                Slett skjema
              </SlettSkjemaKnapp>
            </li>
          )}
        </FormsList>
      </nav>
    </AppLayoutWithContext>
  );
}
