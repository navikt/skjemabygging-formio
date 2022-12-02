import { Back, Close } from "@navikt/ds-icons";
import { Button, Stepper } from "@navikt/ds-react";
import { formSummaryUtil, NavFormType, Panel, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useLanguages } from "../../context/languages";

type FormStepperProps = {
  form: NavFormType;
  formUrl: string;
  submission: object;
};

const FormStepper = ({ form, formUrl, submission }: FormStepperProps) => {
  const openButton = useRef<HTMLButtonElement>(null);
  const { url } = useRouteMatch();
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);
  const { search } = useLocation();
  const formSteps = useMemo(() => {
    const conditionals = formSummaryUtil.mapAndEvaluateConditionals(form, submission);
    return (form.components as Panel[])
      .filter((component) => component.type === "panel")
      .filter((component) => conditionals[component.key] !== true)
      .map((panel) => ({ label: panel.title, url: `${formUrl}/${panel.key}` }));
  }, [form, formUrl, submission]);

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
              <Stepper.Step to={`${step.url}${search}`} as={Link} key={step.url} completed>
                {translate(step.label)}
              </Stepper.Step>
            ))}
            <Stepper.Step to={url} as={Link}>
              {translate(TEXTS.statiske.summaryPage.title)}
            </Stepper.Step>
          </Stepper>
        </div>
      </nav>
    </>
  );
};

export default FormStepper;
