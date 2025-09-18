import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router-dom';
import ValidationExclamationIcon from '../../../../components/icons/ValidationExclamationIcon';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryPanel = ({ component, submissionPath, componentRegistry, panelValidationList }: FormComponentProps) => {
  const { title, components, navId, key } = component;
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { formUrl } = useForm();

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
            <RenderComponent
              key={`${component.key}-${navId}`}
              component={component}
              submissionPath={componentSubmissionPath}
              componentRegistry={componentRegistry}
            />
          );
        })}
      </FormSummary.Answers>

      <FormSummary.EditLink as={Link} to={{ pathname: `${formUrl}/${key}`, search }}>
        {translate(TEXTS.grensesnitt.summaryPage.edit)}
      </FormSummary.EditLink>
    </FormSummary>
  );
};

export default SummaryPanel;
