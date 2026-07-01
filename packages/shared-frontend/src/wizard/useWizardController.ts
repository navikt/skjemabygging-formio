import { Component, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo, useState } from 'react';
import { useFormDefinition } from '../context/form-definition/FormDefinitionContext';
import { usePersistence } from '../context/persistence/PersistenceContext';
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
const useWizardController = (): WizardController => {
  const { panels } = useFormDefinition();
  const { validatePage, hideSummary } = useValidation();
  const { saveDraft, canSaveDraft } = usePersistence();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPanel = panels[currentIndex];
  const components = useMemo(() => currentPanel?.components ?? [], [currentPanel]);

  const goToNext = useCallback(() => {
    if (!currentPanel) return false;
    const valid = validatePage(currentPanel.key, components);
    if (valid && currentIndex < panels.length - 1) {
      setCurrentIndex((index) => index + 1);
      if (canSaveDraft) {
        void saveDraft();
      }
    }
    return valid;
  }, [currentPanel, validatePage, components, currentIndex, panels.length, canSaveDraft, saveDraft]);

  const goToPrevious = useCallback(() => {
    hideSummary();
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, [hideSummary]);

  const goTo = useCallback(
    (panelKey: string) => {
      const index = panels.findIndex((panel) => panel.key === panelKey);
      if (index >= 0) {
        hideSummary();
        setCurrentIndex(index);
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

export { useWizardController };
export type { WizardController };
