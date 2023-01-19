import { Tag } from "@navikt/ds-react";
import React from "react";

const LabelWithDiff = ({ label, diff = false }) => {
  return (
    <div className="label-track-changes">
      <span>{label}</span>
      {diff && (
        <Tag variant="warning-filled" size="xsmall">
          Endring
        </Tag>
      )}
    </div>
  );
};

export default LabelWithDiff;
