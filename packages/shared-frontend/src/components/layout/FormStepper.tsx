import { Box, FormProgress } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';

interface Step {
  key: string;
  label: string;
}

interface Props {
  /** 0-based index of the active step among ALL steps (leading + panels + trailing). */
  activeIndex: number;
  /** Extra steps prepended before the panels (e.g. "Introduksjon"). */
  leadingSteps?: Step[];
  /** Extra steps appended after the panels (e.g. "Oppsummering"). */
  trailingSteps?: Step[];
  /** Called when the user clicks a step. If not provided, steps are not clickable. */
  onStepClick?: (key: string, index: number) => void;
}

/**
 * Wizard stepper built on Aksel FormProgress. Derives the step list from the
 * FormDefinitionContext panels so it stays in sync with conditional panel visibility.
 * Lives in shared-frontend (not shared-components) so the new render path owns it.
 */
const FormStepper = ({ activeIndex, leadingSteps = [], trailingSteps = [], onStepClick }: Props) => {
  const { translate } = useLanguage();
  const { panels } = useFormDefinition();
  const [open, setOpen] = useState(false);

  const steps: Step[] = [
    ...leadingSteps,
    ...panels.map((panel) => ({ key: panel.key, label: panel.title ?? panel.key })),
    ...trailingSteps,
  ];

  return (
    <Box marginBlock="space-0 space-24">
      <FormProgress
        totalSteps={steps.length}
        activeStep={activeIndex + 1}
        open={open}
        onOpenChange={setOpen}
        translations={{
          step: translate(TEXTS.grensesnitt.stepper.step),
          showAllSteps: translate(TEXTS.grensesnitt.stepper.showAllSteps),
          hideAllSteps: translate(TEXTS.grensesnitt.stepper.hideAllSteps),
        }}
      >
        {steps.map((step, index) => (
          <FormProgress.Step
            key={step.key}
            onClick={
              onStepClick
                ? (event) => {
                    event.preventDefault();
                    if (activeIndex !== index) {
                      onStepClick(step.key, index);
                      setOpen(false);
                    }
                  }
                : undefined
            }
            href={`#step-${step.key}`}
          >
            {translate(step.label)}
          </FormProgress.Step>
        ))}
      </FormProgress>
    </Box>
  );
};

export default FormStepper;
