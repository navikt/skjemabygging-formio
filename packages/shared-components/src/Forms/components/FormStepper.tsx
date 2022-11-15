import { Stepper } from "@navikt/ds-react";
import { formSummaryUtil, NavFormType, Panel, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useMemo } from "react";
import { Link, useRouteMatch } from "react-router-dom";

type FormStepperProps = {
  form: NavFormType;
  formUrl: string;
  submission: object;
};

const FormStepper = ({ form, formUrl, submission }: FormStepperProps) => {
  const { url } = useRouteMatch();

  const formSteps = useMemo(() => {
    const conditionals = formSummaryUtil.mapAndEvaluateConditionals(form, submission);
    return (form.components as Panel[])
      .filter((component) => component.type === "panel")
      .filter((component) => conditionals[component.key] !== true)
      .map((panel) => ({ label: panel.title, url: `${formUrl}/${panel.key}` }));
  }, [form, formUrl, submission]);

  return (
    <Stepper activeStep={formSteps.length + 1}>
      {formSteps.map((step) => (
        <Stepper.Step to={step.url} as={Link} key={step.url} completed>
          {step.label}
        </Stepper.Step>
      ))}
      <Stepper.Step to={url} as={Link}>
        {TEXTS.statiske.summaryPage.title}
      </Stepper.Step>
    </Stepper>
  );
};

export default FormStepper;
