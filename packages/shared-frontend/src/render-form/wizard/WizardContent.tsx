import { navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import FormHeader from '../../layout/FormHeader';
import FormStepper from '../../layout/FormStepper';
import { StepperProvider } from '../../layout/StepperContext';
import { AttachmentUploadPage } from '../attachments/AttachmentUploadPage';
import IntroPage from '../intro/IntroPage';
import PanelPage from '../pages/PanelPage';
import PrepareSubmissionPage from '../pages/PrepareSubmissionPage';
import ReceiptPage from '../pages/ReceiptPage';
import StandardAttachmentPage from '../pages/StandardAttachmentPage';
import SummaryPage from '../pages/SummaryPage';
import type { FormRendererRoute, SharedFormRendererProps } from '../types';
import SecondaryActions from './SecondaryActions';
import { ATTACHMENTS_KEY, INTRO_KEY, SUMMARY_KEY } from './constants';
import useRendererNavigation from './useRendererNavigation';

const WizardContent = ({ host, route }: { host: SharedFormRendererProps['host']; route: FormRendererRoute }) => {
  const { form, panels } = useFormDefinition();
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const navigate = useRendererNavigation(host);
  const [stepperOpen, setStepperOpen] = useState(false);
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const hasAttachment = navFormUtils.hasAttachment(form);
  const { submissionMethod } = useAppConfig();
  const usesUploadPage =
    (submissionMethod === 'digital' || submissionMethod === 'digitalnologin') &&
    navFormUtils
      .flattenComponents(attachmentPanel?.components ?? [])
      .some((component) => component.type === 'attachment');
  const panelIndex = route.kind === 'panel' ? panels.findIndex((panel) => panel.key === route.panelKey) : -1;
  const activeIndex =
    route.kind === 'intro'
      ? 0
      : route.kind === 'attachments'
        ? 1 + panels.length
        : route.kind === 'summary'
          ? 1 + panels.length + (hasAttachment ? 1 : 0)
          : panelIndex >= 0
            ? 1 + panelIndex
            : 0;
  const pageTitle =
    route.kind === 'intro'
      ? translate(TEXTS.grensesnitt.introPage.title)
      : route.kind === 'attachments'
        ? translate(attachmentPanel?.title ?? TEXTS.statiske.attachment.title)
        : route.kind === 'summary'
          ? translate(TEXTS.statiske.summaryPage.title)
          : route.kind === 'panel'
            ? translate(panels[panelIndex]?.title ?? '')
            : '';

  if (route.kind === 'receipt') {
    return <ReceiptPage host={host} route={route} />;
  }
  if (route.kind === 'prepare-submission') {
    return <PrepareSubmissionPage host={host} type={route.type} />;
  }

  const selectStep = (key: string) => {
    if (key === INTRO_KEY) {
      navigate({ kind: 'intro' });
    } else if (key === ATTACHMENTS_KEY) {
      navigate({ kind: 'attachments' });
    } else if (key === SUMMARY_KEY) {
      navigate({ kind: 'summary' });
    } else {
      navigate({ kind: 'panel', panelKey: key });
    }
  };

  return (
    <StepperProvider isOpen={stepperOpen}>
      <FormHeader form={form} pageTitle={pageTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={[{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }]}
        trailingSteps={[
          ...(hasAttachment ? [{ key: ATTACHMENTS_KEY, label: TEXTS.statiske.attachment.title }] : []),
          { key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title },
        ]}
        onStepClick={(key) => {
          if (window.innerWidth < 768) {
            setStepperOpen(false);
          }
          selectStep(key);
        }}
        open={stepperOpen}
        onOpenChange={setStepperOpen}
      />
      {route.kind === 'intro' && (
        <IntroPage
          tokenExpiration={host.noLogin?.tokenExpiration}
          getNoLoginToken={host.noLogin?.getToken}
          onStart={() => navigate({ kind: 'panel', panelKey: panels[0]?.key ?? '' })}
          actions={<SecondaryActions host={host} showIdentification />}
        />
      )}
      {route.kind === 'panel' && <PanelPage host={host} panelKey={route.panelKey} focusId={route.focusId} />}
      {route.kind === 'attachments' &&
        (attachmentPanel && usesUploadPage ? (
          <AttachmentUploadPage
            adapter={host.attachments}
            onPrevious={() => navigate({ kind: 'panel', panelKey: panels[panels.length - 1]?.key ?? '' })}
            onNext={() => navigate({ kind: 'summary' })}
            onCancel={
              host.secondaryActions
                ? async () => {
                    await host.secondaryActions?.cancel(submission);
                  }
                : undefined
            }
            exitUrl={host.secondaryActions?.exitUrl}
          />
        ) : (
          <StandardAttachmentPage host={host} />
        ))}
      {route.kind === 'summary' && <SummaryPage host={host} />}
    </StepperProvider>
  );
};

export default WizardContent;
