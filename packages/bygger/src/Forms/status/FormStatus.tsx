import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import moment from "moment";
import React from "react";
import FormStatusIndicator from "./FormStatusIndicator";
import { useStatusStyles } from "./styles";
import { Status, StreetLightSize } from "./types";

export function determineStatus(formProperties: FormPropertiesType): Status {
  const { modified, published, isTestForm, unpublished } = formProperties;
  let modifiedDate = moment(modified);
  const unpublishedDate = unpublished !== undefined ? moment(unpublished) : undefined;

  if (isTestForm) {
    return "TESTFORM";
  }

  if (modified && published) {
    if (moment(modified).isAfter(moment(published))) {
      return "PENDING";
    }
    return "PUBLISHED";
  }

  if (unpublishedDate?.isSameOrAfter(modifiedDate)) {
    return "UNPUBLISHED";
  } else if (modified) {
    return "DRAFT";
  }

  return "UNKNOWN";
}

type FormStatusProps = { status: Status; size: StreetLightSize };

const FormStatus = ({ status, size }: FormStatusProps) => {
  const styles = useStatusStyles();
  const statusTexts: Record<Status, string> = {
    PUBLISHED: "Publisert",
    UNPUBLISHED: "Avpublisert",
    PENDING: "Upubliserte endringer",
    DRAFT: "Utkast",
    UNKNOWN: "Ukjent status",
    TESTFORM: "Testskjema",
  };
  return (
    <div className={styles.statusRow}>
      <FormStatusIndicator status={status} size={size} />
      <p className={styles.rowText}>{statusTexts[status]}</p>
    </div>
  );
};

export default FormStatus;
