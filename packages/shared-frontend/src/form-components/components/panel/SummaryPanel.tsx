import { FormSummary } from '@navikt/ds-react';
import { TEXTS, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import ValidationExclamationIcon from '../../../components/icons/ValidationExclamationIcon';
import { withoutSubmissionNavigationState } from '../../../form/navigationState';
import { useStepperState } from '../../../layout/StepperContext';
import RenderComponent from '../../RenderComponent';
import { FormComponentProps } from '../../types';
import styles from './SummaryPanel.module.css';

const SummaryPanel = (props: FormComponentProps) => {
  const { submissionPath, translate, component, panelValidationList } = props;
  const { title, components, navId, key } = component;
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const { isOpen: isStepperOpen } = useStepperState();
  const childComponents = components ?? [];
  const isAttachmentPanel = childComponents.some((child) => child.type === 'attachment');
  const navigationState = withoutSubmissionNavigationState(state);

  const panelValidation = panelValidationList?.find((panel) => panel.key === key);

  return (
    <FormSummary data-cy="form-summary-panel" className={styles.panel}>
      <FormSummary.Header>
        <FormSummary.Heading level="3">
          {translate(title)}
          {panelValidation?.hasValidationErrors && (
            <ValidationExclamationIcon title={translate(TEXTS.statiske.summaryPage.validationIcon)} />
          )}
        </FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        {childComponents.map((component) => {
          const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);
          return (
            <RenderComponent
              {...props}
              key={`${component.key}-${navId}`}
              component={component}
              submissionPath={componentSubmissionPath}
            />
          );
        })}
      </FormSummary.Answers>

      <FormSummary.Footer>
        <FormSummary.EditLink
          href={search ? `../${key}${search}` : `../${key}`}
          onClick={(event) => {
            event.preventDefault();
            navigate({ pathname: `../${key}`, search }, { state: navigationState });
          }}
          aria-label={isAttachmentPanel && !isStepperOpen ? translate(title) : undefined}
        >
          {translate(TEXTS.grensesnitt.summaryPage.edit)}
        </FormSummary.EditLink>
      </FormSummary.Footer>
    </FormSummary>
  );
};

export default SummaryPanel;
