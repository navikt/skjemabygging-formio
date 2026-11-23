import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { INTRO_KEY, SUMMARY_KEY } from './constants';
import { focusPageTitleAfterNavigation } from './focusPageTitleAfterNavigation';
import FormHeader from './layout/FormHeader';
import FormStepper from './layout/FormStepper';

interface Props {
  leadingSteps?: { key: string; label: string }[];
  form: Form;
  formTitle?: string;
  activeIndex: number;
  pageTitle: string;
  onStepClick: (key: string) => void;
  children: ReactNode;
}

const FormFlowLayout = ({ form, formTitle, activeIndex, pageTitle, onStepClick, children, leadingSteps }: Props) => {
  const { key, pathname, hash, state } = useLocation();
  const previousPathname = useRef<string | undefined>(undefined);
  const locationState = typeof state === 'object' && state ? (state as Record<string, unknown>) : undefined;
  const trailingSteps = [{ key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title }];
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const handleStepClick = (key: string) => {
    if (window.innerWidth < 768) {
      setIsStepperOpen(false);
    }
    onStepClick(key);
  };

  useEffect(() => {
    const isNavigationBetweenSteps = previousPathname.current !== undefined && previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (!isNavigationBetweenSteps) {
      return;
    }

    const hasFieldFocusTarget = Boolean(hash || locationState?.focusId);
    const isRedirect = locationState?.redirect === true;
    if (hasFieldFocusTarget || isRedirect) {
      return;
    }

    return focusPageTitleAfterNavigation();
  }, [hash, key, locationState?.focusId, locationState?.redirect, pathname]);

  return (
    <>
      <FormHeader form={form} pageTitle={pageTitle} formTitle={formTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={leadingSteps ?? [{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }]}
        trailingSteps={trailingSteps}
        onStepClick={handleStepClick}
        open={isStepperOpen}
        onOpenChange={setIsStepperOpen}
      />
      {children}
    </>
  );
};

export default FormFlowLayout;
