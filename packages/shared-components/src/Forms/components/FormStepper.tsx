import { Back, Close } from "@navikt/ds-icons";
import { Button, Stepper } from "@navikt/ds-react";
import { NavFormType, navFormUtils, Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { useAppConfig } from "../../configContext";

type FormStepperProps = {
  form: NavFormType;
  formUrl: string;
  submission?: Submission;
};

const FormStepper = ({ form, submission, formUrl }: FormStepperProps) => {
  const { submissionMethod } = useAppConfig();
  const openButton = useRef<HTMLButtonElement>(null);
  const { search, pathname } = useLocation();
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);
  const { loggNavigering } = useAmplitude();
  const formSteps = useMemo(() => {
    return navFormUtils
      .getActivePanelsFromForm(form, submission, submissionMethod)
      .map((panel) => ({ label: panel.title, url: `${formUrl}/${panel.key}` }));
  }, [form, formUrl, submissionMethod, submission]);

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
        className={`stegindikator stepper${isOpen ? " stepper--open" : ""}`}
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
          <Stepper activeStep={formSteps.length + 1}>
            {formSteps.map((step) => (
              <Stepper.Step
                to={`${step.url}${search}`}
                as={Link}
                key={step.url}
                completed
                onClick={() => {
                  loggNavigering({
                    lenkeTekst: translate(step.label),
                    destinasjon: step.url,
                  });
                }}
              >
                {translate(step.label)}
              </Stepper.Step>
            ))}
            <Stepper.Step to={pathname} as={Link}>
              {translate(TEXTS.statiske.summaryPage.title)}
            </Stepper.Step>
          </Stepper>
        </div>
      </nav>
    </>
  );
};

export default FormStepper;
