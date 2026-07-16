import { Component, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo, useState } from 'react';
import { useFormDefinition } from '../context/form-definition/FormDefinitionContext';
import { useValidation } from '../context/validation/ValidationContext';

interface WizardController {
  panels: Panel[];
  currentPanel?: Panel;
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  components: Component[];
  goToNext: () => boolean;
  goToPrevious: () => void;
  goTo: (panelKey: string) => void;
}

/**
 * Controls wizard navigation: current panel, prev/next, and validating only the current panel
 * before advancing. Validation sets the page error state (and shows the summary on failure).
 */
const useWizardController = (requestedPanelKey?: string): WizardController => {
  const { panels } = useFormDefinition();
  const { validatePage, hideSummary } = useValidation();
  const [localCurrentIndex, setLocalCurrentIndex] = useState(0);
  const requestedIndex = requestedPanelKey ? panels.findIndex((panel) => panel.key === requestedPanelKey) : -1;
  const currentIndex = requestedIndex >= 0 ? requestedIndex : localCurrentIndex;

  const currentPanel = panels[currentIndex];
  const components = useMemo(() => currentPanel?.components ?? [], [currentPanel]);

  const goToNext = useCallback(() => {
    if (!currentPanel) return false;
    const valid = validatePage(currentPanel.key, components);
    if (valid && currentIndex < panels.length - 1) {
      if (!requestedPanelKey) {
        setLocalCurrentIndex((index) => index + 1);
      }
    }
    return valid;
  }, [currentPanel, validatePage, components, currentIndex, panels.length, requestedPanelKey]);

  const goToPrevious = useCallback(() => {
    hideSummary();
    if (!requestedPanelKey) {
      setLocalCurrentIndex((index) => Math.max(0, index - 1));
    }
  }, [hideSummary, requestedPanelKey]);

  const goTo = useCallback(
    (panelKey: string) => {
      const index = panels.findIndex((panel) => panel.key === panelKey);
      if (index >= 0 && !requestedPanelKey) {
        hideSummary();
        setLocalCurrentIndex(index);
      }
    },
    [panels, hideSummary, requestedPanelKey],
  );

  return {
    panels,
    currentPanel,
    currentIndex,
    isFirst: currentIndex === 0,
    isLast: currentIndex === panels.length - 1,
    components,
    goToNext,
    goToPrevious,
    goTo,
  };
};

export { useWizardController };
export type { WizardController };
