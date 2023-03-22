import { makeStyles } from "@material-ui/styles";
import { Checkbox, Heading } from "@navikt/ds-react";
import React from "react";
import { Link } from "react-router-dom";
import { DryRunResult } from "../../../types/migration";
import FormStatusPanel from "../../Forms/status/FormStatusPanel";
import BreakingChangesWarning from "./BreakingChangesWarning";

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
});

interface MigrationDryRunResultsProps {
  dryRunResults: DryRunResult[];
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
              <Heading level="2" size="small">
                {result.title} ({result.skjemanummer})
              </Heading>
              <p>
                Antall komponenter som vil bli påvirket av migreringen: {result.changed} av {result.found}
              </p>
              {hasBreakingChanges && <BreakingChangesWarning breakingChanges={breakingChanges} />}
              {result.diff.length > 0 && (
                <pre style={{ whiteSpace: "break-spaces" }}>{JSON.stringify(result.diff, null, 2)}</pre>
              )}
              <Link className="knapp margin-bottom-default margin-top-default" to={getPreviewUrl(result.path)}>
                Forhåndsvis
              </Link>
            </div>
            <div className={styles.sideColumn}>
              {result.changed > 0 && (
                <Checkbox
                  checked={selectedPaths.includes(result.path)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selectedPaths, result.path]);
                    } else {
                      onChange(selectedPaths.filter((path) => path !== result.path));
                    }
                  }}
                >
                  Inkluder i migrering
                </Checkbox>
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
