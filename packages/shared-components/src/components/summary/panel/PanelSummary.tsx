import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { Accordion, Link } from '@navikt/ds-react';
import { SummaryPanel, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link as ReactRouterLink, useLocation } from 'react-router';
import { useLanguages } from '../../../context/languages';
import makeStyles from '../../../util/styles/jss/jss';
import ComponentSummary from '../component/ComponentSummary';

interface Props {
  component: SummaryPanel;
  hasValidationErrors: boolean;
}

const panelStyles = makeStyles({
  link: {
    display: 'block',
    marginBottom: '2rem',
  },
  headerIcon: {
    alignSelf: 'center',
    marginLeft: '0.5rem',
    color: 'var(--a-orange-600)',
  },
  accordionHeader: {
    display: 'flex',
  },
});

const PanelSummary = ({ component, hasValidationErrors }: Props) => {
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
            <Link as={ReactRouterLink} to={{ pathname: `../${key}`, search }} className={link}>
              <span>{panelLinkText}</span>
            </Link>
            <dl>
              <ComponentSummary components={components} />
            </dl>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </section>
  );
};

export default PanelSummary;
