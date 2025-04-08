import { Back, Close } from '@navikt/ds-icons';
import { Button, Stepper } from '@navikt/ds-react';
import { NavFormType, Submission, TEXTS, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAppConfig } from '../../../context/config/configContext';
import { useLanguages } from '../../../context/languages';

type FormStepperProps = {
  form: NavFormType;
  formUrl: string;
  submission?: Submission;
  activeStep?: string;
  completed?: boolean;
  setSubmission?: any;
};

const FormStepper = ({ form, submission, formUrl, activeStep, completed }: FormStepperProps) => {
  const { submissionMethod } = useAppConfig();
  const { panelSlug } = useParams();
  const openButton = useRef<HTMLButtonElement>(null);
  const { search } = useLocation();
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);
  const formSteps = useMemo(() => {
    const formioSteps = navFormUtils
      .getActivePanelsFromForm(form, submission, submissionMethod)
      .map((panel) => ({ label: panel.title, key: panel.key }));
    return [
      ...formioSteps,
      {
        key: 'oppsummering',
        label: TEXTS.statiske.summaryPage.title,
      },
    ];
  }, [form, submissionMethod, submission]);

  const getActiveStepper = () => {
    return formSteps.findIndex((step) => step.key === (activeStep ?? panelSlug));
  };

  const onOpen = () => {
    setIsOpen(!isOpen);
  };

  const onClose = () => {
    setIsOpen(false);
    openButton.current?.focus();
  };

  return (
    <>
      <Button
        className="stepper-toggle"
        icon={<Back aria-hidden />}
        onClick={onOpen}
        size="small"
        variant="secondary"
        ref={openButton}
      >
        {translate(TEXTS.grensesnitt.stepper.toggleText, {
          currentStep: formSteps.length,
          totalSteps: formSteps.length + 1,
        })}
      </Button>
      {isOpen && <div className="stepper-backdrop"></div>}
      <nav
        aria-label="Søknadssteg"
        id="{{ ctx.wizardKey }}-header"
        className={`stegindikator stepper${isOpen ? ' stepper--open' : ''}`}
      >
        <div className="stepper-container">
          {isOpen && (
            <Button
              className="stepper-close"
              icon={<Close aria-hidden />}
              onClick={onClose}
              variant="tertiary"
              autoFocus
            >
              {translate(TEXTS.grensesnitt.close)}
            </Button>
          )}
          <Stepper activeStep={getActiveStepper() + 1}>
            {formSteps.map((step, index) => (
              <Stepper.Step
                to={`${formUrl}/${step.key}${search}`}
                as={Link}
                key={step.key}
                completed={completed ? getActiveStepper() > index : false}
              >
                {translate(step.label)}
              </Stepper.Step>
            ))}
          </Stepper>
        </div>
      </nav>
    </>
  );
};

export default FormStepper;
