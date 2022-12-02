import { makeStyles } from "@material-ui/styles";
import { Checkbox } from "nav-frontend-skjema";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";
import { Link } from "react-router-dom";
import { DryRunResult } from "../../../types/migration";
import BreakingChangesWarning from "./BreakingChangesWarning";

const useStyles = makeStyles({
  titleRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: "2rem",
  },
  title: {
    marginRight: "2rem",
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
          <li key={result.skjemanummer}>
            <div className={styles.titleRow}>
              <Undertittel className={styles.title}>
                {result.title} ({result.skjemanummer})
              </Undertittel>
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
            </div>
            <p>
              Antall komponenter som vil bli påvirket av migreringen: {result.changed} av {result.found}
            </p>
            {hasBreakingChanges && <BreakingChangesWarning breakingChanges={breakingChanges} />}
            {result.diff.length > 0 && (
              <pre style={{ whiteSpace: "break-spaces" }}>{JSON.stringify(result.diff, null, 2)}</pre>
            )}
            <Link className="knapp margin-bottom-default" to={getPreviewUrl(result.path)}>
              Forhåndsvis
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default MigrationDryRunResults;
