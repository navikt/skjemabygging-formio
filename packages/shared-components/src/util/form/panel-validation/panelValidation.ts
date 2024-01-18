import { Component, formSummaryUtil, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';

export type PanelValidation = {
  key: string;
  summaryComponents?: string[];
  firstInputComponent?: Component;
  hasValidationErrors: boolean;
  firstInputWithValidationError?: string;
};

const findFirstInputWithValidationError = (wizardComponent, data): Component | undefined => {
  const valid = wizardComponent.checkValidity(data);
  if (!valid && wizardComponent.component.input) {
    return wizardComponent.component;
  }

  for (const subComponent of wizardComponent?.components ?? []) {
    const firstInputWithError = findFirstInputWithValidationError(subComponent, data);
    if (!!firstInputWithError) {
      return firstInputWithError;
    }
  }
  return undefined;
};

export const validateWizardPanels = (formioInstance, form: NavFormType, submission: Submission): PanelValidation[] => {
  const formSummaryPanels = formSummaryUtil.createFormSummaryPanels(form, submission, (txt: string) => txt, false);
  return formSummaryPanels
    .map((panel) => formioInstance.components.find((wizardComponent) => wizardComponent.key === panel.key))
    .filter(
      (wizardComponent) => wizardComponent.component.type === 'panel' && !wizardComponent.component.isAttachmentPanel,
    )
    .map((panel): PanelValidation => {
      const firstInput = formSummaryUtil.findFirstInput(panel);
      const firstInputWithValidationError = findFirstInputWithValidationError(panel, submission?.data ?? {});
      return {
        key: panel.key as string,
        hasValidationErrors: firstInputWithValidationError !== undefined,
        firstInputComponent: firstInput,
        firstInputWithValidationError: firstInputWithValidationError?.key,
        summaryComponents: formSummaryPanels.find((formSummaryPanel) => formSummaryPanel.key === panel.key).components,
      };
    });
};

// Returns key of panel (and possibly component) that either has validation errors or no submission
export const findFormStartingPoint = (
  form: NavFormType,
  panelValidations?: PanelValidation[],
): { panel?: string; component?: string } => {
  // If no panels are empty or contains errors, return the first panel
  if (!panelValidations || panelValidations.length === 0) {
    return { panel: form.components[0]?.key };
  }

  let firstEmptyPanelIndex: number | undefined;
  let firstPanelWithError: number | undefined;

  // find the first panel with error and the first panel with no submission values
  panelValidations.forEach((validation, index) => {
    if (validation.hasValidationErrors && firstPanelWithError === undefined) {
      firstPanelWithError = index;
    }
    if (
      (validation.summaryComponents ?? []).length === 0 &&
      !!validation.firstInputComponent &&
      firstEmptyPanelIndex === undefined
    ) {
      firstEmptyPanelIndex = index;
    }
  });

  const lastPanelIndex = panelValidations.length - 1;
  // return first panel with error if it comes before (or is the same as) the first panel with no submissions
  if (typeof firstPanelWithError === 'number' && firstPanelWithError <= (firstEmptyPanelIndex ?? lastPanelIndex)) {
    const component = panelValidations[firstPanelWithError!].firstInputWithValidationError;
    return { panel: panelValidations[firstPanelWithError!].key, component };
  }

  // if no panels were empty, default to the last panel
  if (!firstEmptyPanelIndex) firstEmptyPanelIndex = 0;
  // return the key of the panel and the key of the panel's first input component, if any
  const panel = panelValidations[firstEmptyPanelIndex].key;
  const firstInputInPanel: Component | undefined = formSummaryUtil.findFirstInput(
    form.components?.[firstEmptyPanelIndex],
  );
  const component = firstInputInPanel?.key ?? '';
  return { panel, component };
};
