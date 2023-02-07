import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";

const ToggleDiffButton = () => {
  const { diffOn, setDiffOn, featureToggles } = useAppConfig();
  if (featureToggles?.enableDiff) {
    return (
      <div>
        {diffOn ? (
          <a href="#" onClick={() => setDiffOn?.(false)}>
            Skjul
          </a>
        ) : (
          <a href="#" onClick={() => setDiffOn?.(true)}>
            Vis
          </a>
        )}
      </div>
    );
  }
  return null;
};

export default ToggleDiffButton;
