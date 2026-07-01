import { FormSummary } from '@navikt/ds-react';
import { TEXTS, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router';
import ValidationExclamationIcon from '../../../components/icons/ValidationExclamationIcon';
import RenderComponent from '../../RenderComponent';
import { FormComponentProps } from '../../types';
import styles from './SummaryPanel.module.css';

const SummaryPanel = (props: FormComponentProps) => {
  const { submissionPath, translate, component, panelValidationList } = props;
  const { title, components, navId, key } = component;
  const { search } = useLocation();

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
        {components?.map((component) => {
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
        <FormSummary.EditLink as={Link} to={{ pathname: `../${key}`, search }}>
          {translate(TEXTS.grensesnitt.summaryPage.edit)}
        </FormSummary.EditLink>
      </FormSummary.Footer>
    </FormSummary>
  );
};

export default SummaryPanel;
