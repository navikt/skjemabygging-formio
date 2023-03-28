import { makeStyles } from "@material-ui/styles";
import { Checkbox } from "nav-frontend-skjema";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";
import { Link } from "react-router-dom";
import { FormMigrationLogData } from "../../../types/migration";
import FormStatusPanel from "../../Forms/status/FormStatusPanel";
import BreakingChangesWarning from "./BreakingChangesWarning";
import ComponentDependencies from "./ComponentDependencies";

const useStyles = makeStyles({
  row: {
    display: "flex",
    flexDirection: "row",
    marginTop: "3rem",
  },
  mainColumn: {
    flex: 3,
  },
  sideColumn: {
    flex: 1,
    width: "14rem",
    marginLeft: "3rem",
  },
  resultContainer: {
    marginBottom: "1.5rem",
  },
  data: {
    whiteSpace: "break-spaces",
    overflowWrap: "anywhere",
    maxWidth: "100%",
    marginBottom: "0",
  },
});

interface MigrationDryRunResultsProps {
  dryRunResults: FormMigrationLogData[];
  selectedPaths: string[];
  onChange: (val: string[]) => void;
  getPreviewUrl: (val: string) => string;
}

const MigrationDryRunResults = ({
  dryRunResults,
  selectedPaths,
  onChange,
  getPreviewUrl,
}: MigrationDryRunResultsProps) => {
  const styles = useStyles();

  return (
    <ul>
      {dryRunResults.map((result) => {
        const { breakingChanges } = result;
        const hasBreakingChanges = breakingChanges && breakingChanges.length > 0;

        return (
          <li key={result.skjemanummer} className={styles.row}>
            <div className={styles.mainColumn}>
              <Undertittel>
                {result.title} ({result.skjemanummer})
              </Undertittel>
              <p>
                Antall komponenter som vil bli påvirket av migreringen: {result.changed} av {result.found}
              </p>
              {hasBreakingChanges && <BreakingChangesWarning breakingChanges={breakingChanges} />}
              {result.diff.map((componentDiff) => {
                const componentKey = componentDiff.key || componentDiff["key_ORIGINAL"];
                return (
                  <div className={styles.resultContainer} key={componentKey}>
                    <pre className={styles.data}>{JSON.stringify(componentDiff, null, 2)}</pre>
                    <ComponentDependencies dependencies={result.dependencies[componentKey]} />
                  </div>
                );
              })}
              <Link className="knapp margin-bottom-default margin-top-default" to={getPreviewUrl(result.path)}>
                Forhåndsvis
              </Link>
            </div>
            <div className={styles.sideColumn}>
              {result.changed > 0 && (
                <Checkbox
                  label={"Inkluder i migrering"}
                  checked={selectedPaths.includes(result.path)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selectedPaths, result.path]);
                    } else {
                      onChange(selectedPaths.filter((path) => path !== result.path));
                    }
                  }}
                />
              )}
              <FormStatusPanel publishProperties={result} spacing={"small"} hideToggleDiffButton />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MigrationDryRunResults;
