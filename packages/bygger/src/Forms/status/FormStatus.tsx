import moment from "moment";
import React from "react";
import FormStatusIndicator from "./FormStatusIndicator";
import { useStatusStyles } from "./styles";
import { Props, Status, StreetLightSize } from "./types";

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

type FormStatusProps = Props & { size: StreetLightSize };

const FormStatus = ({ formProperties, size }: FormStatusProps) => {
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

export default FormStatus;
