import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import moment from "moment";
import React from "react";
import FormStatusIndicator from "./FormStatusIndicator";
import { useStatusStyles } from "./styles";
import { Status, StreetLightSize } from "./types";

export function determineStatus(formProperties: FormPropertiesType): Status {
  const { modified, published } = formProperties;
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

type FormStatusProps = { status: Status; size: StreetLightSize };

const FormStatus = ({ status, size }: FormStatusProps) => {
  const styles = useStatusStyles({ size });
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
