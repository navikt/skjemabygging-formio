import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sidetittel, Undertittel } from "nav-frontend-typografi";
import { makeStyles } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";
import { SlettSkjemaKnapp } from "./components";
import { ExpandFilled, CollapseFilled } from "@navikt/ds-icons";

const useFormsListStyles = makeStyles({
  list: {
    listStyle: "none",
    padding: "0",
  },
  listTitles: {
    padding: "0.3rem 0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(5rem,10rem) auto minmax(5rem,10rem)",
    backgroundColor: "#c1c1c1",
  },
  listTitleItems: {
    display: "flex",
    alignItems: "center",
  },
  listTitleLastItem: {
    justifySelf: "center",
  },
  listTitle: {
    marginRight: "0.5rem",
  },
});

const FormsList = ({ forms, children }) => {
  const classes = useFormsListStyles();
  const [sortedForms, setSortedForms] = useState();
  const [toggleFormNumber, setToggleFormNumber] = useState("");
  const [toggleFormTitle, setToggleFormTitle] = useState("");

  function sortFormByFormNumber(forms) {
    const filteredInResult = [];
    const filteredOutResult = [];
    for (const form of forms) {
      (form["skjemanummer"].match(/(NAV)\s\d\d-\d\d.\d\d/) ? filteredInResult : filteredOutResult).push(form);
    }

    if (toggleFormNumber === "ascending") {
      setToggleFormNumber("decending");
      setSortedForms(
        sortForm(filteredOutResult, "skjemanummer", "ascending").concat(
          sortForm(filteredInResult, "skjemanummer", "decending")
        )
      );
    } else {
      setToggleFormNumber("ascending");
      setSortedForms(
        sortForm(filteredInResult, "skjemanummer", "ascending").concat(
          sortForm(filteredOutResult, "skjemanummer", "decending")
        )
      );
    }
  }

  function sortFormByFormTitle(forms) {
    if (toggleFormTitle === "ascending") {
      setToggleFormTitle("decending");
      setSortedForms(sortForm(forms, "title", "decending"));
    } else {
      setToggleFormTitle("ascending");
      setSortedForms(sortForm(forms, "title", "ascending"));
    }
  }

  const sortForm = (forms, sortingKey, sortingOrder) =>
    forms.sort((a, b) => {
      if (sortingOrder === "ascending") {
        return a[sortingKey] < b[sortingKey] ? -1 : 1;
      } else {
        return a[sortingKey] < b[sortingKey] ? 1 : -1;
      }
    });

  return (
    <ul className={classes.list}>
      <li className={classes.listTitles}>
        <div className={classes.listTitleItems} onClick={() => sortFormByFormNumber(forms)}>
          <Undertittel className={classes.listTitle}>Skjemanr.</Undertittel>
          {toggleFormNumber === "ascending" ? <CollapseFilled /> : <ExpandFilled />}
        </div>
        <div className={classes.listTitleItems} onClick={() => sortFormByFormTitle(forms)}>
          <Undertittel className={classes.listTitle}>Skjematittel</Undertittel>
          {toggleFormTitle === "ascending" ? <CollapseFilled /> : <ExpandFilled />}
        </div>
        <Undertittel className={classes.listTitleLastItem}>Action</Undertittel>
      </li>
      {toggleFormNumber === "" && toggleFormTitle === ""
        ? forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map((form) => children(form))
        : sortedForms.map((form) => children(form))}
    </ul>
  );
};

const useFormsListPageStyles = makeStyles({
  root: {
    maxWidth: "50rem",
    margin: "0 auto 2rem",
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
});

function simplifiedForms(forms) {
  return forms.map((form) => ({
    modified: form.modified,
    title: form.title.trim(),
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
