import { FormSummary } from '@navikt/ds-react';
import { TEXTS, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router';
import ValidationExclamationIcon from '../../../components/icons/ValidationExclamationIcon';
import { PanelDefinition } from '../../component-types';
import RenderComponent from '../../RenderComponent';
import { FormComponentProps } from '../../types';

const SummaryPanel = (props: FormComponentProps<PanelDefinition>) => {
  const { submissionPath, translate, component, panelValidationList } = props;
  const { title, components, navId, key } = component;
  const { search, state } = useLocation();
  const childComponents = components ?? [];

  const panelValidation = panelValidationList?.find((panel) => panel.key === key);

  return (
    <FormSummary data-cy="form-summary-panel">
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
        <FormSummary.EditLink as={Link} to={{ pathname: `../${key}`, search }} state={state}>
          {translate(TEXTS.grensesnitt.summaryPage.edit)}
        </FormSummary.EditLink>
      </FormSummary.Footer>
    </FormSummary>
  );
};

export default SummaryPanel;
