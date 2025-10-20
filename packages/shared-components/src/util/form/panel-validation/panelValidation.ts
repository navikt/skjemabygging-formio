import {
  Component,
  formSummaryUtil,
  NavFormType,
  navFormUtils,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AttachmentValidator } from '../../../components/attachment/attachmentValidator';

export type PanelValidation = {
  key: string;
  summaryComponents?: string[];
  firstInputComponent?: Component;
  hasValidationErrors: boolean;
  firstInputWithValidationError?: string;
};

const findFirstInputWithValidationError = (wizardComponent, data): string | undefined => {
  // Need to tell the Formio root component that the form has been submitted, to trigger validation.
  wizardComponent.root.submitted = true;
  const valid = wizardComponent.checkValidity(data);
  if (
    !valid &&
    wizardComponent.component.input &&
    wizardComponent.type !== 'datagrid' &&
    wizardComponent.type !== 'container'
  ) {
    return wizardComponent.path;
  }

  for (const subComponent of wizardComponent?.components ?? []) {
    const firstInputWithError = findFirstInputWithValidationError(subComponent, data);
    if (firstInputWithError) {
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
        firstInputWithValidationError: firstInputWithValidationError,
        summaryComponents: formSummaryPanels.find((formSummaryPanel) => formSummaryPanel.key === panel.key).components,
      };
    });
};

export const findFirstValidationErrorInAttachmentPanel = (
  form: NavFormType,
  submission: Submission,
  validator: AttachmentValidator,
): Component | undefined => {
  const attachmentPanel = form.components.find((panel) => panel.isAttachmentPanel);
  return attachmentPanel?.components?.find((component) => {
    const submissionAttachment = submission.attachments?.find(
      (attachment) => attachment.attachmentId === component.navId,
    );
    return (
      navFormUtils.isComponentConditionallyVisible(component, submission, form) &&
      !!validator.validate(component.label, submissionAttachment)
    );
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
