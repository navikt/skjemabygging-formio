import { Button } from "@navikt/ds-react";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";

const noop = () => {};

const ToggleDiffButton = ({ className }) => {
  const { diffOn, setDiffOn = noop, featureToggles } = useAppConfig();
  if (featureToggles?.enableDiff) {
    return (
      <Button className={className} variant="tertiary" size="xsmall" onClick={() => setDiffOn(!diffOn)}>
        {diffOn ? "Skjul endringer" : "Vis endringer"}
      </Button>
    );
  }
  return null;
};

export default ToggleDiffButton;
