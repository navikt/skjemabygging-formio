import React from "react";
import { makeStyles } from "@material-ui/styles";

import { AppLayoutWithContext } from "../components/AppLayout";

const ResourceList = ({ className, loadLanguages }) => {
  loadLanguages().then((response) =>
    response.map((content) => {
      console.log("content", content.data);
      return <ul className={className}></ul>;
    })
  );
};

const useResourceListStyles = makeStyles({
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
    gridTemplateColumns: "auto 6rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
});

export function ResourceListPage({ onLogout, loadLanguages }) {
  const classes = useResourceListStyles();
  loadLanguages().then((response) => console.log(response));
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Oversettelser",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
        logout: onLogout,
      }}
    >
      <nav className={classes.root}>
        <ResourceList className={classes.list} loadLanguages={loadLanguages} />
      </nav>
    </AppLayoutWithContext>
  );
}
