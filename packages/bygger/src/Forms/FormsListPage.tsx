import { makeStyles } from "@material-ui/styles";
import { Down, Up, UpDown } from "@navikt/ds-icons";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Hovedknapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import ActionRow from "../components/layout/ActionRow";
import {
  SimpleNavFormType,
  simplifiedForms,
  sortByFormNumber,
  sortByStatus,
  SortDirection,
  sortFormsByProperty,
} from "./formsListUtils";
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

type SortByProperty = "formNumber" | "formTitle" | "formStatus" | "none";

const SortIcon = ({ direction }: { direction?: SortDirection }) => {
  if (direction === "ascending") return <Up />;
  if (direction === "descending") return <Down />;
  return <UpDown />;
};

interface FormsListProps {
  forms: SimpleNavFormType[];
  children: React.FC<SimpleNavFormType>;
}

const FormsList = ({ forms, children }: FormsListProps) => {
  const classes = useFormsListStyles();
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>();
  const [sortBy, setSortBy] = useState<SortByProperty | undefined>();

  const sortedFormsList = useMemo(() => {
    const sortedByModified = sortFormsByProperty(forms, "modified", "descending");
    switch (sortBy) {
      case "formTitle":
        return sortFormsByProperty(sortedByModified, "title", sortDirection);
      case "formNumber":
        return sortByFormNumber(sortedByModified, sortDirection);
      case "formStatus":
        return sortByStatus(sortedByModified, sortDirection);
      default:
        return sortedByModified;
    }
  }, [forms, sortBy, sortDirection]);

  function nextSortDirection(currentSortDirection?: SortDirection): SortDirection | undefined {
    if (!currentSortDirection) return "ascending";
    if (currentSortDirection === "ascending") return "descending";
    return undefined;
  }

  function toggleSortState(selectedProperty: SortByProperty) {
    if (sortBy !== selectedProperty) {
      setSortBy(selectedProperty);
      setSortDirection("ascending");
    } else {
      const newSortDirection = nextSortDirection(sortDirection);
      setSortDirection(newSortDirection);
      if (!newSortDirection) setSortBy(undefined);
    }
  }

  return (
    <ul className={classes.list} data-testid="forms-list">
      <li className={classes.listTitles}>
        <div className={classes.listTitleItems} onClick={() => toggleSortState("formNumber")}>
          <Undertittel className={classes.listTitle}>Skjemanr.</Undertittel>
          <SortIcon direction={sortBy === "formNumber" ? sortDirection : undefined} />
        </div>
        <div className={classes.listTitleItems} onClick={() => toggleSortState("formTitle")}>
          <Undertittel className={classes.listTitle}>Skjematittel</Undertittel>
          <SortIcon direction={sortBy === "formTitle" ? sortDirection : undefined} />
        </div>
        <div className={classes.listTitleItems} onClick={() => toggleSortState("formStatus")}>
          <Undertittel className={classes.statusListTitle}>Status</Undertittel>
          <SortIcon direction={sortBy === "formStatus" ? sortDirection : undefined} />
        </div>
      </li>
      {sortedFormsList.map(children)}
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
