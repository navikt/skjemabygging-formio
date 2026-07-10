import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormHeader, FormStepper } from '@navikt/skjemadigitalisering-shared-frontend';
import { ReactNode } from 'react';
import { INTRO_KEY, SUMMARY_KEY } from './constants';

interface Props {
  form: Form;
  activeIndex: number;
  pageTitle: string;
  onStepClick: (key: string) => void;
  children: ReactNode;
}

const WizardStep = ({ form, activeIndex, pageTitle, onStepClick, children }: Props) => (
  <>
    <FormHeader form={form} pageTitle={pageTitle} />
    <FormStepper
      activeIndex={activeIndex}
      leadingSteps={[{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }]}
      trailingSteps={[{ key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title }]}
      onStepClick={onStepClick}
    />
    {children}
  </>
);

export default WizardStep;
