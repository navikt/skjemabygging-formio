import { Down, Up, UpDown } from "@navikt/ds-icons";
import { Button, Heading } from "@navikt/ds-react";
import { LoadingComponent, makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import ActionRow from "../components/layout/ActionRow";
import {
  asFormMetadata,
  FormMetadata,
  sortByFormNumber,
  sortByStatus,
  SortDirection,
  sortFormsByProperty,
} from "./formsListUtils";
import FormStatus from "./status/FormStatus";

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
  formMetadataList: FormMetadata[];
  children: React.FC<FormMetadata>;
}

const FormsList = ({ formMetadataList, children }: FormsListProps) => {
  const classes = useFormsListStyles();
  const [sortDirection, setSortDirection] = useState<SortDirection>();
  const [sortBy, setSortBy] = useState<SortByProperty>();

  const sortedFormsList = useMemo(() => {
    const sortedByModified = sortFormsByProperty(formMetadataList, "modified", "descending");
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
  }, [formMetadataList, sortBy, sortDirection]);

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
          <Heading level="2" size="small">
            Skjemanr.
          </Heading>
          <SortIcon direction={sortBy === "formNumber" ? sortDirection : undefined} />
        </div>
        <div className={classes.listTitleItems} onClick={() => toggleSortState("formTitle")}>
          <Heading level="2" size="small">
            Skjematittel
          </Heading>
          <SortIcon direction={sortBy === "formTitle" ? sortDirection : undefined} />
        </div>
        <div className={classes.listTitleItems} onClick={() => toggleSortState("formStatus")}>
          <Heading level="2" size="small">
            Status
          </Heading>
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

interface FormsListPageProps {
  loadFormsList: () => Promise<NavFormType[]>;
}

const FormsListPage = ({ loadFormsList }: FormsListPageProps) => {
  const navigate = useNavigate();
  const classes = useFormsListPageStyles();
  const [status, setStatus] = useState("LOADING");
  const [forms, setForms] = useState<NavFormType[]>();

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

  const onNew = () => navigate("/forms/new");

  return (
    <AppLayout
      navBarProps={{
        title: "Skjemaoversikt",
        visSkjemaliste: false,
        visOversettelseliste: true,
      }}
    >
      <ActionRow>
        <Button className={classes.centerColumn} onClick={onNew}>
          Lag nytt skjema
        </Button>
      </ActionRow>
      <nav className={classes.root}>
        <Heading level="2" size="small">
          Velg skjema:
        </Heading>
        <FormsList formMetadataList={forms.map(asFormMetadata)}>
          {(formMetadata) => (
            <li className={classes.listItem} key={formMetadata.path}>
              <Link className="lenke" data-testid="editLink" to={`${formMetadata.path}/edit`}>
                {formMetadata.skjemanummer}
              </Link>
              <Link className="lenke" data-testid="editLink" to={`${formMetadata.path}/edit`}>
                {formMetadata.title}
              </Link>
              <FormStatus status={formMetadata.status} size="small" />
            </li>
          )}
        </FormsList>
      </nav>
    </AppLayout>
  );
};

export { FormsListPage, FormsList };
