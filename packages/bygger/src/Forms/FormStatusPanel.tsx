import { ClassNameMap, makeStyles } from "@material-ui/styles";
import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import moment from "moment";
import Panel from "nav-frontend-paneler";
import { Element } from "nav-frontend-typografi";
import React from "react";
import { languagesInNorwegian } from "../context/i18n";

type Status = "PENDING" | "DRAFT" | "PUBLISHED" | "UNKNOWN";
type StreetLightSize = "small" | "large";

const langCodeBokmal = "nb-NO";
export const allLanguagesInNorwegian = {
  ...languagesInNorwegian,
  [langCodeBokmal]: "Norsk bokmål",
};

const useFormStatusIndicatorStyles = makeStyles({
  streetLight: (props: { size: StreetLightSize }) => ({
    maxWidth: props.size === "small" ? "1rem" : "1.5rem",
    height: props.size === "small" ? "1rem" : "1.5rem",
    borderRadius: "50%",
    marginRight: "0.75rem",
    flex: "1",
  }),
  published: {
    backgroundColor: "#219653",
  },
  pending: {
    backgroundColor: "#F2C94C",
  },
  draft: {
    backgroundColor: "#2D9CDB",
  },
});

const useStatusStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  statusRow: (props: { size?: StreetLightSize }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: props?.size === "large" ? "0.5rem" : 0,
  }),
  rowText: {
    flex: "1",
    margin: "0",
  },
  panelItem: {
    "&:not(:last-child)": {
      marginBottom: "2.5rem",
    },
  },
});

function determineStatus(modified, published): Status {
  if (modified && published) {
    if (moment(modified).isAfter(moment(published))) {
      return "PENDING";
    }
    return "PUBLISHED";
  }
  if (modified) {
    return "DRAFT";
  }
  return "UNKNOWN";
}

export const FormStatusIndicator = ({ status, size }: { status: Status; size: StreetLightSize }) => {
  const styles = useFormStatusIndicatorStyles({ size });
  switch (status) {
    case "PUBLISHED":
      return <span className={`${styles.streetLight} ${styles.published}`} />;
    case "PENDING":
      return <span className={`${styles.streetLight} ${styles.pending}`} />;
    case "DRAFT":
      return <span className={`${styles.streetLight} ${styles.draft}`} />;
    case "UNKNOWN":
    default:
      return <></>;
  }
};

export const FormStatus = ({ formProperties, size }: { formProperties: FormPropertiesType; size: StreetLightSize }) => {
  const styles = useStatusStyles({ size });
  const status = determineStatus(formProperties.modified, formProperties.published);
  const statusTexts: Record<Status, string> = {
    PUBLISHED: "Publisert",
    PENDING: "Upubliserte endringer",
    DRAFT: "Utkast",
    UNKNOWN: "Ukjent status",
  };
  return (
    <div className={styles.statusRow}>
      <FormStatusIndicator status={status} size={size} />
      <p className={styles.rowText}>{statusTexts[status]}</p>
    </div>
  );
};

const Timestamp = ({ label, timestamp }: { label: string; timestamp?: string }) => {
  const styles = useStatusStyles();
  if (!timestamp) {
    return <></>;
  }
  const timestampAsMoment = moment(timestamp);
  const dateAndTime = `${timestampAsMoment.format("DD.MM.YY")}, kl. ${timestampAsMoment.format("HH.mm")}`;
  return (
    <div className={styles.panelItem}>
      <Element>{label}</Element>
      <p className={styles.rowText}>{dateAndTime}</p>
    </div>
  );
};

interface PublishedLanguagesProps {
  formProperties: FormPropertiesType;
}
const PublishedLanguages = ({ formProperties }: PublishedLanguagesProps) => {
  const styles = useStatusStyles();
  if (formProperties.published && formProperties.publishedLanguages) {
    const sortedLanguageCodes = [...formProperties.publishedLanguages, langCodeBokmal].sort();
    return (
      <div className={styles.panelItem}>
        <Element>Publiserte språk:</Element>
        {sortedLanguageCodes.map((langCode) => {
          return (
            <p key={langCode} className={styles.rowText}>
              {allLanguagesInNorwegian[langCode]}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface Props {
  formProperties: FormPropertiesType;
}

const FormStatusPanel = ({ formProperties }: Props) => {
  const styles: ClassNameMap = useStatusStyles();
  const { modified, published } = formProperties;

  return (
    <Panel className={styles.container}>
      <div className={styles.panelItem}>
        <Element>Status:</Element>
        <FormStatus formProperties={formProperties} size={"large"} />
      </div>
      <Timestamp label={"Sist lagret:"} timestamp={modified} />
      <Timestamp label={"Sist publisert:"} timestamp={published} />
      <PublishedLanguages formProperties={formProperties} />
    </Panel>
  );
};

export default FormStatusPanel;
