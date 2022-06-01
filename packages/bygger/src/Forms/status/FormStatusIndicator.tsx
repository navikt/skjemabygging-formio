import React from "react";
import { useFormStatusIndicatorStyles } from "./styles";
import { Status, StreetLightSize } from "./types";

const FormStatusIndicator = ({ status, size }: { status: Status; size: StreetLightSize }) => {
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

export default FormStatusIndicator;
