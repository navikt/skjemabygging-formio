import { makeStyles } from "@material-ui/styles";
import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import moment from "moment";
import Panel from "nav-frontend-paneler";
import { Element } from "nav-frontend-typografi";
import React from "react";

type Status = "PENDING" | "DRAFT" | "PUBLISHED" | "UNKNOWN";

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

const useFormStatusIndicatorStyles = makeStyles({
  streetLight: {
    maxWidth: "1.5rem",
    height: "1.5rem",
    borderRadius: "50%",
    marginRight: "1rem",
    flex: "1",
  },
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

const FormStatusIndicator = ({ status }: { status: Status }) => {
  const styles = useFormStatusIndicatorStyles();
  switch (status) {
    case "PUBLISHED":
      return <div className={`${styles.streetLight} ${styles.published}`} />;
    case "PENDING":
      return <div className={`${styles.streetLight} ${styles.pending}`} />;
    case "DRAFT":
      return <div className={`${styles.streetLight} ${styles.draft}`} />;
    case "UNKNOWN":
    default:
      return <></>;
  }
};

const useStatusStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: {
    flex: "1",
    margin: "0",
  },
  panelItem: {
    "&:not(:last-child)": {
      marginBottom: "3rem",
    },
  },
});

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

const statusTexts: Record<Status, string> = {
  PUBLISHED: "Publisert",
  PENDING: "Upubliserte endringer",
  DRAFT: "Utkast",
  UNKNOWN: "Ukjent status",
};

interface Props {
  formProperties: FormPropertiesType;
}

const FormStatusPanel = ({ formProperties }: Props) => {
  const styles = useStatusStyles();
  const { modified, published } = formProperties;
  const status = determineStatus(modified, published);

  return (
    <Panel className={styles.container}>
      <div className={styles.panelItem}>
        <Element>Status:</Element>
        <div className={styles.row}>
          <FormStatusIndicator status={status} />
          <p className={styles.rowText}>{statusTexts[status]}</p>
        </div>
      </div>
      <Timestamp label={"Sist lagret:"} timestamp={modified} />
      <Timestamp label={"Sist publisert:"} timestamp={published} />
    </Panel>
  );
};

export default FormStatusPanel;
