import { Form, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useState } from 'react';
import { FormHeader, FormStepper, StepperProvider } from '../framework';
import { ATTACHMENTS_KEY, INTRO_KEY, SUMMARY_KEY } from './constants';

interface Props {
  form: Form;
  activeIndex: number;
  pageTitle: string;
  onStepClick: (key: string) => void;
  children: ReactNode;
}

const WizardStep = ({ form, activeIndex, pageTitle, onStepClick, children }: Props) => (
  <WizardStepContent form={form} activeIndex={activeIndex} pageTitle={pageTitle} onStepClick={onStepClick}>
    {children}
  </WizardStepContent>
);

const WizardStepContent = ({ form, activeIndex, pageTitle, onStepClick, children }: Props) => {
  const trailingSteps = [
    ...(navFormUtils.hasAttachment(form) ? [{ key: ATTACHMENTS_KEY, label: TEXTS.statiske.attachment.title }] : []),
    { key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title },
  ];
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const handleStepClick = (key: string) => {
    if (window.innerWidth < 768) {
      setIsStepperOpen(false);
    }
    onStepClick(key);
  };

  return (
    <StepperProvider isOpen={isStepperOpen}>
      <FormHeader form={form} pageTitle={pageTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={[{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }]}
        trailingSteps={trailingSteps}
        onStepClick={handleStepClick}
        open={isStepperOpen}
        onOpenChange={setIsStepperOpen}
      />
      {children}
    </StepperProvider>
  );
};

export default WizardStep;
