import { FormProgress } from '@navikt/ds-react';
import { navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useResolvedPath } from 'react-router';
import { useAppConfig } from '../../../context/config/configContext';
import { useForm } from '../../../context/form/FormContext';
import { useLanguages } from '../../../context/languages';

const FormStepper = () => {
  const { form, submission, formProgress, setFormProgress } = useForm();
  const { submissionMethod, baseUrl } = useAppConfig();
  const [screenSmall, setScreenSmall] = useState<boolean>(false);
  const params = useParams();
  const panelSlug = params.panelSlug ?? params['*'];
  const { search } = useLocation();
  const navigate = useNavigate();
  const formUrl = useResolvedPath('').pathname;
  const { translate } = useLanguages();

  const formSteps = useMemo(() => {
    const formioSteps = navFormUtils
      .getActivePanelsFromForm(form, submission, submissionMethod)
      .map((panel) => ({ label: panel.title, key: panel.key }));

    const steps = [...formioSteps];

    if (submissionMethod === 'digitalnologin') {
      steps.push({
        key: 'vedlegg',
        label: TEXTS.statiske.attachment.title,
      });
    }

    steps.push({
      key: 'oppsummering',
      label: TEXTS.statiske.summaryPage.title,
    });

    return steps;
  }, [form, submissionMethod, submission]);

  const getActiveStepper = () => {
    return formSteps.findIndex((step) => step.key === panelSlug);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (!screenSmall) {
          setScreenSmall(true);
        }
      } else if (screenSmall) {
        setScreenSmall(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [screenSmall]);

  return (
    <div className="mb">
      <FormProgress
        totalSteps={formSteps.length}
        activeStep={getActiveStepper() + 1}
        open={formProgress}
        onOpenChange={(state) => setFormProgress(state)}
        translations={{
          step: translate(TEXTS.grensesnitt.stepper.step),
          showAllSteps: translate(TEXTS.grensesnitt.stepper.showAllSteps),
          hideAllSteps: translate(TEXTS.grensesnitt.stepper.hideAllSteps),
        }}
      >
        {formSteps.map((step, index) => {
          const stepUrl = `${formUrl}/../${step.key}${search}`;
          return (
            <FormProgress.Step
              onClick={(event) => {
                event.preventDefault();
                if (getActiveStepper() !== index) {
                  navigate(stepUrl);
                  if (screenSmall) {
                    setFormProgress(false);
                  }
                }
              }}
              href={`${baseUrl}${stepUrl}`}
              key={step.key}
            >
              {translate(step.label)}
            </FormProgress.Step>
          );
        })}
      </FormProgress>
    </div>
  );
};

export default FormStepper;
