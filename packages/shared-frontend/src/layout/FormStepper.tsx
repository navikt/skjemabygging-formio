import { Box, FormProgress } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useFormDefinition } from '../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../context/language/LanguageContext';

interface Step {
  key: string;
  label: string;
}

interface Props {
  activeIndex: number;
  leadingSteps?: Step[];
  trailingSteps?: Step[];
  onStepClick?: (key: string, index: number) => void;
}

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
