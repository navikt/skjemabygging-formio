import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryPanel = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { title, components, navId, key } = component;
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { formUrl } = useForm();

  return (
    <FormSummary>
      <FormSummary.Header>
        <FormSummary.Heading level="2">{title}</FormSummary.Heading>
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

/*

const PanelSummary = ({ component, formUrl, hasValidationErrors }: Props) => {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { link, headerIcon, accordionHeader } = panelStyles();
  const { key, label, components } = component;
  const panelLinkText = `${translate(TEXTS.grensesnitt.summaryPage.edit)} ${label.toLowerCase()}`;

  return (
    <section>
      <Accordion headingSize="medium">
        <Accordion.Item defaultOpen={true}>
          <Accordion.Header>
            <div className={accordionHeader}>
              {label}
              {hasValidationErrors && (
                <ExclamationmarkTriangleFillIcon
                  className={headerIcon}
                  title={translate(TEXTS.statiske.summaryPage.validationIcon)}
                  fontSize="1.5rem"
                />
              )}
            </div>
          </Accordion.Header>
          <Accordion.Content>
            <Link as={ReactRouterLink} to={{ pathname: `${formUrl}/${key}`, search }} className={link}>
              <span>{panelLinkText}</span>
            </Link>
            <dl>
              <ComponentSummary components={components} formUrl={formUrl} />
            </dl>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </section>
  );
};

export default PanelSummary;

 */
