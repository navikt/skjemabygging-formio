import { makeStyles } from "@material-ui/styles";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { DependeeComponent } from "../../../types/migration";

const useStyles = makeStyles({
  row: {
    lineHeight: "1.3",
    margin: 0,
  },
  heading: {
    fontWeight: "bold",
  },
  label: {
    paddingRight: "1rem",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 10fr",
    gridTemplateRows: "repeat(3, 1.3rem)",
  },
  separator: {
    width: "12rem",
    height: "0.5rem",
    marginBottom: "0.5rem",
    borderBottom: `1px solid ${navCssVariables.navGra60}`,
  },
});

const ComponentDependencies = ({ dependencies }: { dependencies: DependeeComponent[] }) => {
  const styles = useStyles();
  const matching = dependencies?.filter((dependee) => dependee.matchesFilters);

  if (!matching || matching.length === 0) return null;

  return (
    <div>
      <div className={styles.heading}>Har avhengighet til</div>
      {matching.map((dependee, index) => (
        <div key={dependee.key}>
          {index > 0 && <div className={styles.separator} />}
          <div className={styles.gridContainer}>
            <div>Key:</div>
            <div>{dependee.key}</div>
            <div>Label:</div>
            <div>{dependee.label}</div>
            <div>Type:</div>
            <div>{dependee.types}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponentDependencies;
