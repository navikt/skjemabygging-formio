import { flattenComponents, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import Alert from '../../components/alert/Alert';
import { useFormDefinitionForm, useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { SUMMARY_KEY } from '../../form-flow/constants';
import FormFlowLayout from '../../form-flow/FormFlowLayout';
import { useFieldFocus } from '../../form-flow/useFieldFocus';
import { useSendinnStepNavigation } from './useSendinnStepNavigation';

const SendinnFormFlowLayout = () => {
  const { pathname } = useLocation();
  const { translate } = useLanguage();
  const form = useFormDefinitionForm();
  const panels = useFormDefinitionPanels();
  const goToStep = useSendinnStepNavigation();
  const routeKey = pathname.slice(`/${form.path}`.length).replace(/^\//, '');
  const summary = routeKey === SUMMARY_KEY;
  const panelIndex = panels.findIndex((panel) => panel.key === routeKey);
  const currentIndex = Math.max(panelIndex, 0);
  const hasAttachments = useMemo(
    () => flattenComponents(form.components).some((component) => component.type === 'attachment'),
    [form],
  );
  const formTitle = translate(TEXTS.statiske.sendinn.journey.formTitle, { title: translate(form.title) });

  useFieldFocus({ preferInputFocus: true });
  useEffect(() => {
    document.title = formTitle;
  }, [formTitle]);

  return (
    <div data-journey="form">
      <FormFlowLayout
        form={form}
        formTitle={formTitle}
        pageTitle={summary ? TEXTS.statiske.summaryPage.title : (panels[currentIndex]?.title ?? form.title)}
        activeIndex={summary ? panels.length : currentIndex}
        leadingSteps={[]}
        onStepClick={(key) => goToStep(key)}
      >
        {hasAttachments ? (
          <Outlet />
        ) : (
          <Alert variant="info">{translate(TEXTS.statiske.sendinn.noMatchingDocuments)}</Alert>
        )}
      </FormFlowLayout>
    </div>
  );
};

export { SendinnFormFlowLayout };
