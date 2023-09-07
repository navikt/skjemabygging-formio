import { Back, Close } from "@navikt/ds-icons";
import { Button, Stepper } from "@navikt/ds-react";
import { formSummaryUtil, NavFormType, navFormUtils, Panel, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useMemo, useRef, useState } from "react";
import { Link, useHref, useLocation } from "react-router-dom";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { useAppConfig } from "../../configContext";

type FormStepperProps = {
  form: NavFormType;
  submission: object;
};

const FormStepper = ({ form, submission }: FormStepperProps) => {
  const { submissionMethod } = useAppConfig();
  const openButton = useRef<HTMLButtonElement>(null);
  const { search, pathname } = useLocation();
  const formUrl = useHref("../");
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);
  const { loggNavigering } = useAmplitude();
  const formSteps = useMemo(() => {
    const conditionals = formSummaryUtil.mapAndEvaluateConditionals(form, submission);
    return (form.components as Panel[])
      .filter((component) => component.type === "panel")
      .filter((component) => conditionals[component.key] !== false)
      .filter((component) => !(submissionMethod === "digital" && navFormUtils.isVedleggspanel(component)))
      .map((panel) => ({ label: panel.title, url: `${formUrl}${panel.key}` }));
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
                onClick={(e) => {
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
