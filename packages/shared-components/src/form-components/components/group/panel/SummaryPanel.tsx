import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router';
import ValidationExclamationIcon from '../../../../components/icons/ValidationExclamationIcon';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryPanel = (props: FormComponentProps) => {
  const { submissionPath, translate, component, panelValidationList } = props;
  const { title, components, navId, key } = component;
  const { search } = useLocation();

  const panelValidation = panelValidationList?.find((panel) => panel.key === key);

  return (
    <FormSummary>
      <FormSummary.Header>
        <FormSummary.Heading level="2">
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
            <RenderComponent {...props} key={`${component.key}-${navId}`} submissionPath={componentSubmissionPath} />
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
