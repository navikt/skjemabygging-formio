import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";

const ToggleDiffButton = () => {
  const { diffOn, setDiffOn, featureToggles } = useAppConfig();
  if (featureToggles?.enableDiff) {
    const toggleAnchorHref = "#"; // TODO use button instead of anchor?
    return (
      <div>
        {diffOn ? (
          <a href={toggleAnchorHref} onClick={() => setDiffOn?.(false)}>
            Skjul
          </a>
        ) : (
          <a href={toggleAnchorHref} onClick={() => setDiffOn?.(true)}>
            Vis
          </a>
        )}
      </div>
    );
  }
  return null;
};

export default ToggleDiffButton;
