import { makeStyles } from "@material-ui/styles";
import { CollapseFilled, ExpandFilled } from "@navikt/ds-icons";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Hovedknapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import ActionRow from "../components/layout/ActionRow";
import { simplifiedForms, sortFormsByStatus } from "./formsListUtils";
import { FormStatus } from "./FormStatusPanel";

const useFormsListStyles = makeStyles({
  list: {
    listStyle: "none",
    padding: "0",
  },
  listTitles: {
    padding: "0.3rem 0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(5rem,10rem) auto 8rem",
    backgroundColor: "#c1c1c1",
  },
  listTitleItems: {
    display: "flex",
    alignItems: "center",
  },
  statusListTitle: {
    paddingLeft: "2rem",
  },
  listTitle: {
    marginRight: "0.5rem",
  },
});

const FormsList = ({ forms, children }) => {
  const classes = useFormsListStyles();
  const [sortedForms, setSortedForms] = useState([]);
  const [toggleFormNumber, setToggleFormNumber] = useState("");
  const [toggleFormTitle, setToggleFormTitle] = useState("");
  const [toggleFormStatus, setToggleFormStatus] = useState("");

  function sortFormByFormNumber(forms) {
    const filteredInResult = [];
    const filteredOutResult = [];
    for (const form of forms) {
      (form["skjemanummer"].match(/(NAV)\s\d\d-\d\d.\d\d/) ? filteredInResult : filteredOutResult).push(form);
    }

    if (toggleFormNumber === "ascending") {
      setToggleFormNumber("decending");
      setSortedForms([
        ...sortForm(filteredOutResult, "skjemanummer", "ascending"),
        ...sortForm(filteredInResult, "skjemanummer", "decending"),
      ]);
    } else {
      setToggleFormNumber("ascending");
      setSortedForms([
        ...sortForm(filteredInResult, "skjemanummer", "ascending"),
        ...sortForm(filteredOutResult, "skjemanummer", "decending"),
      ]);
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
    <ul className={classes.list} data-testid="forms-list">
      <li className={classes.listTitles}>
        <div className={classes.listTitleItems} onClick={() => sortFormByFormNumber(forms)}>
          <Undertittel className={classes.listTitle}>Skjemanr.</Undertittel>
          {toggleFormNumber === "ascending" ? <CollapseFilled /> : <ExpandFilled />}
        </div>
        <div className={classes.listTitleItems} onClick={() => sortFormByFormTitle(forms)}>
          <Undertittel className={classes.listTitle}>Skjematittel</Undertittel>
          {toggleFormTitle === "ascending" ? <CollapseFilled /> : <ExpandFilled />}
        </div>
        <div
          className={classes.listTitleItems}
          onClick={() => {
            setToggleFormStatus(toggleFormStatus === "ascending" ? "descending" : "ascending");
            setSortedForms(sortFormsByStatus(forms, toggleFormStatus === "ascending"));
          }}
        >
          <Undertittel className={classes.statusListTitle}>Status</Undertittel>
          {toggleFormStatus ? <CollapseFilled /> : <ExpandFilled />}
        </div>
      </li>
      {toggleFormNumber === "" && toggleFormTitle === "" && toggleFormStatus === ""
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
    gridTemplateColumns: "minmax(5rem,10rem) auto 8rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
  centerColumn: {
    gridColumn: "2 / 3",
    width: "max-content",
  },
});

function FormsListPage({ url, loadFormsList }) {
  const history = useHistory();
  const classes = useFormsListPageStyles();
  const [status, setStatus] = useState("LOADING");
  const [forms, setForms] = useState();

  useEffect(() => {
    loadFormsList()
      .then((forms) => {
        setForms(forms);
        setStatus("FINISHED LOADING");
      })
      .catch((e) => {
        console.log(e);
        setStatus("FORMS NOT FOUND");
      });
  }, [loadFormsList]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORMS NOT FOUND" || !forms) {
    return <h1>Finner ingen skjemaer...</h1>;
  }

  const onNew = () => history.push("/forms/new");

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Skjemaoversikt",
        visSkjemaliste: false,
        visOversettelseliste: true,
      }}
    >
      <ActionRow>
        <Hovedknapp className={classes.centerColumn} onClick={onNew}>
          Lag nytt skjema
        </Hovedknapp>
      </ActionRow>
      <nav className={classes.root}>
        <Undertittel className="margin-bottom-default">Velg skjema:</Undertittel>
        <FormsList forms={simplifiedForms(forms)}>
          {(form) => (
            <li className={classes.listItem} key={form.path}>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.skjemanummer}
              </Link>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.title}
              </Link>
              <FormStatus formProperties={form.properties} size={"small"} />
            </li>
          )}
        </FormsList>
      </nav>
    </AppLayoutWithContext>
  );
}

export { FormsListPage, FormsList };
