import { TEXTS, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidation } from '../../context/validation/ValidationContext';
import RenderInputForm from '../../form-components/RenderInputForm';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../layout/FormButtonRow';
import type { SharedFormRendererProps } from '../types';
import { ATTACHMENTS_KEY } from '../wizard/constants';
import SecondaryActions from '../wizard/SecondaryActions';
import useRendererNavigation from '../wizard/useRendererNavigation';

const StandardAttachmentPage = ({ host }: { host: SharedFormRendererProps['host'] }) => {
  const { form, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const { syncPageValidationState, validatePage } = useValidation();
  const navigate = useRendererNavigation(host);
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const components = useMemo(() => attachmentPanel?.components ?? [], [attachmentPanel]);
  const pageKey = attachmentPanel?.key ?? ATTACHMENTS_KEY;

  useEffect(() => {
    if (attachmentPanel) {
      syncPageValidationState(pageKey, components);
    }
  }, [attachmentPanel, components, pageKey, syncPageValidationState]);

  return (
    <>
      <RenderInputForm pageKey={pageKey} pageComponents={components} components={components} />
      <FormErrorSummary
        pageKey={pageKey}
        components={components}
        onNavigateToField={(error, id) => {
          if (error.pageKey !== pageKey) {
            navigate({ kind: 'panel', panelKey: error.pageKey }, { focusId: id });
          }
        }}
      />
      <SecondaryActions host={host} />
      <FormButtonRow
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() => navigate({ kind: 'panel', panelKey: panels[panels.length - 1]?.key ?? '' })}
          />
        }
        nextButton={
          <FormNextButton
            label={translate(
              submissionMethod === 'digital'
                ? TEXTS.grensesnitt.navigation.saveAndContinue
                : TEXTS.grensesnitt.navigation.next,
            )}
            onClick={() => {
              if (validatePage(pageKey, components)) {
                navigate({ kind: 'summary' });
              }
            }}
          />
        }
      />
    </>
  );
};

export default StandardAttachmentPage;
