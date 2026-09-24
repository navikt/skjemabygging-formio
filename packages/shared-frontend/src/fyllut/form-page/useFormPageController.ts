import { Panel } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo } from 'react';
import { useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { toComponentDefinitions } from '../../context/form-definition/formDefinitionUtils';
import { useValidationActions } from '../../context/validation/ValidationContext';
import { ComponentDefinition } from '../../form-components/component-types';

interface FormPageController {
  panels: Panel[];
  currentPanel?: Panel;
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  components: ComponentDefinition[];
  goToNext: () => boolean;
  goToPrevious: () => void;
  goTo: (panelKey: string) => void;
}

const useFormPageController = (requestedPanelKey?: string): FormPageController => {
  const panels = useFormDefinitionPanels();
  const { validatePage, hideErrorSummary } = useValidationActions();
  const requestedIndex = requestedPanelKey ? panels.findIndex((panel) => panel.key === requestedPanelKey) : -1;
  const currentIndex = requestedIndex >= 0 ? requestedIndex : 0;

  const currentPanel = panels[currentIndex];
  const components = useMemo(() => toComponentDefinitions(currentPanel?.components ?? []), [currentPanel]);

  const goToNext = useCallback(() => {
    if (!currentPanel) return false;
    return validatePage(currentPanel.key);
  }, [currentPanel, validatePage]);

  const goToPrevious = useCallback(() => {
    hideErrorSummary();
  }, [hideErrorSummary]);

  const goTo = useCallback(
    (panelKey: string) => {
      if (panels.some((panel) => panel.key === panelKey)) {
        hideErrorSummary();
      }
    },
    [panels, hideErrorSummary],
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
