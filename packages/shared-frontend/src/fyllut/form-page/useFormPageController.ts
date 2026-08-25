import { Component, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo } from 'react';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useValidation } from '../../context/validation/ValidationContext';

interface FormPageController {
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
 * Controls form-page navigation: current panel, prev/next, and validating only the current panel
 * before advancing. Validation sets the page error state (and shows the summary on failure).
 */
const useFormPageController = (requestedPanelKey?: string): FormPageController => {
  const { panels } = useFormDefinition();
  const { validatePage, hideSummary } = useValidation();
  const requestedIndex = requestedPanelKey ? panels.findIndex((panel) => panel.key === requestedPanelKey) : -1;
  const currentIndex = requestedIndex >= 0 ? requestedIndex : 0;

  const currentPanel = panels[currentIndex];
  const components = useMemo(() => currentPanel?.components ?? [], [currentPanel]);

  const goToNext = useCallback(() => {
    if (!currentPanel) return false;
    return validatePage(currentPanel.key, components);
  }, [currentPanel, validatePage, components]);

  const goToPrevious = useCallback(() => {
    hideSummary();
  }, [hideSummary]);

  const goTo = useCallback(
    (panelKey: string) => {
      if (panels.some((panel) => panel.key === panelKey)) {
        hideSummary();
      }
    },
    [panels, hideSummary],
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

export { useFormPageController };
export type { FormPageController };
