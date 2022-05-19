import { makeStyles } from "@material-ui/styles";
import { Down, Up, UpDown } from "@navikt/ds-icons";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Hovedknapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import ActionRow from "../components/layout/ActionRow";
import { SimpleNavFormType, simplifiedForms, sortFormsByStatus } from "./formsListUtils";
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
    cursor: "pointer",
  },
  statusListTitle: {
    paddingLeft: "2rem",
    marginRight: "0.5rem",
  },
  listTitle: {
    marginRight: "0.5rem",
  },
});

const SortByProperty = {
  formNumber: "formNumber",
  formTitle: "formTitle",
  formStatus: "formStatus",
  none: "none",
};

const SortDirection = {
  ascending: "ascending",
  descending: "descending",
  none: "none",
};

const SortIcon = ({ direction }) => {
  if (direction === SortDirection.ascending) return <Up />;
  if (direction === SortDirection.descending) return <Down />;
  return <UpDown />;
};

interface FormsListProps {
  forms: SimpleNavFormType[];
  children: React.FC<SimpleNavFormType>;
}

const FormsList = ({ forms, children }: FormsListProps) => {
  const classes = useFormsListStyles();
  const [sortedForms, setSortedForms] = useState<SimpleNavFormType[]>([]);
  const [toggleFormNumber, setToggleFormNumber] = useState("");
  const [toggleFormTitle, setToggleFormTitle] = useState("");
  const [toggleFormStatus, setToggleFormStatus] = useState("");
  const [sortDirection, setSortDirection] = useState(SortDirection.none);
  const [sortBy, setSortBy] = useState(SortByProperty.none);

  function sortFormByFormNumber(forms: SimpleNavFormType[]) {
    const filteredInResult: SimpleNavFormType[] = [];
    const filteredOutResult: SimpleNavFormType[] = [];
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

  function nextSortDirection(currentSortDirection) {
    if (currentSortDirection === SortDirection.none) return SortDirection.ascending;
    if (currentSortDirection === SortDirection.ascending) return SortDirection.descending;
    return SortDirection.none;
  }

  function toggleSortState(selectedProperty) {
    if (sortBy !== selectedProperty) {
      setSortBy(selectedProperty);
      setSortDirection(SortDirection.ascending);
    } else {
      setSortDirection(nextSortDirection(sortDirection));
      if (sortDirection === SortDirection.none) setSortBy(SortByProperty.none);
    }
  }

  return (
    <ul className={classes.list} data-testid="forms-list">
      <li className={classes.listTitles}>
        <div
          className={classes.listTitleItems}
          onClick={() => {
            toggleSortState(SortByProperty.formTitle);
            sortFormByFormNumber(forms); // TODO: calculate on render instead of storing as state
          }}
        >
          <Undertittel className={classes.listTitle}>Skjemanr.</Undertittel>
          <SortIcon direction={sortBy === SortByProperty.formTitle ? sortDirection : SortDirection.none} />
        </div>
        <div
          className={classes.listTitleItems}
          onClick={() => {
            toggleSortState(SortByProperty.formNumber);
            sortFormByFormTitle(forms); // TODO: calculate on render instead of storing as state
          }}
        >
          <Undertittel className={classes.listTitle}>Skjematittel</Undertittel>
          <SortIcon direction={sortBy === SortByProperty.formNumber ? sortDirection : SortDirection.none} />
        </div>
        <div
          className={classes.listTitleItems}
          onClick={() => {
            toggleSortState(SortByProperty.formStatus);
            setToggleFormStatus(toggleFormStatus === "ascending" ? "descending" : "ascending");
            setSortedForms(sortFormsByStatus(forms, toggleFormStatus === "ascending")); // TODO: calculate on render instead of storing as state
          }}
        >
          <Undertittel className={classes.statusListTitle}>Status</Undertittel>
          <SortIcon direction={sortBy === SortByProperty.formStatus ? sortDirection : SortDirection.none} />
        </div>
      </li>
      {toggleFormNumber === "" && toggleFormTitle === "" && toggleFormStatus === ""
        ? forms.sort((a, b) => ((a.modified || 0) < (b.modified || 0) ? 1 : -1)).map((form) => children(form))
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
