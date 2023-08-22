import { Component, formSummaryUtil, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";

export type PanelValidation = {
  key: string;
  summaryComponents?: string[];
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

export const validateWizardPanels = (formioInstance, form, submission): PanelValidation[] => {
  const formSummaryPanels = formSummaryUtil.createFormSummaryPanels(form, submission, (txt) => txt, false);
  return formioInstance.components
    .filter(
      (wizardComponent) => wizardComponent.component.type === "panel" && !wizardComponent.component.isAttachmentPanel
    )
    .map((panel): PanelValidation => {
      const firstInputWithValidationError = findFirstInputWithValidationError(panel, submission?.data ?? {});
      return {
        key: panel.key as string,
        hasValidationErrors: firstInputWithValidationError !== undefined,
        firstInputWithValidationError: firstInputWithValidationError?.key,
        summaryComponents: formSummaryPanels.find((formSummaryPanel) => formSummaryPanel.key === panel.key).components,
      };
    })
    .filter((panelValidation) => panelValidation);
};

// Returns key of panel and component for:
// the first input component with validation error or
// the first input component of the first panel with no submission values or
// key of the first panel
export const findFormStartingPoint = (
  form: NavFormType,
  panelValidations?: PanelValidation[]
): { panel?: string; component?: string } => {
  if (!panelValidations || panelValidations.length === 0) {
    return { panel: form.components[0]?.key };
  }

  let firstEmptyPanelIndex;
  let firstPanelWithError;

  panelValidations.forEach((validation, index) => {
    if (validation.hasValidationErrors && firstPanelWithError === undefined) {
      firstPanelWithError = index;
    }
    if ((validation.summaryComponents ?? []).length === 0 && firstEmptyPanelIndex === undefined) {
      firstEmptyPanelIndex = index;
    }
  });

  const lastPanelIndex = panelValidations.length - 1;
  if ((firstPanelWithError ?? lastPanelIndex) < (firstEmptyPanelIndex ?? lastPanelIndex)) {
    const component = panelValidations[firstPanelWithError].firstInputWithValidationError;
    return { panel: panelValidations[firstPanelWithError].key, component };
  }
  if (!firstEmptyPanelIndex) firstEmptyPanelIndex = 0;

  const panel = panelValidations[firstEmptyPanelIndex].key;
  const firstInputInPanel: Component | undefined = formSummaryUtil.findFirstInput(
    form.components?.[firstEmptyPanelIndex]
  );
  const component = firstInputInPanel?.key ?? "";
  return { panel, component };
};
