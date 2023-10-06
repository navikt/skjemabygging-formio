import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { Accordion, Heading } from '@navikt/ds-react';
import { Summary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link, useLocation } from 'react-router-dom';
import { useAmplitude } from '../../context/amplitude';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/jss';
import ComponentSummary from './ComponentSummary';

interface Props {
  component: Summary.Panel;
  formUrl: string;
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
    flexDirection: 'row',
  },
});

const PanelSummary = ({ component, formUrl, hasValidationErrors }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { link, headerIcon, accordionHeader } = panelStyles();
  const { key, label, components } = component;
  const panelLinkText = `${translate(TEXTS.grensesnitt.summaryPage.edit)} ${label.toLowerCase()}`;

  return (
    <section>
      <Accordion>
        <Accordion.Item defaultOpen={true}>
          <Accordion.Header>
            <div className={accordionHeader}>
              <Heading level="3" size="medium">
                {label}
              </Heading>
              {hasValidationErrors && (
                <ExclamationmarkTriangleFillIcon
                  className={headerIcon}
                  title="Opplysninger mangler"
                  fontSize="1.5rem"
                />
              )}
            </div>
          </Accordion.Header>
          <Accordion.Content>
            <Link
              to={{ pathname: `${formUrl}/${key}`, search }}
              className={link}
              onClick={(e) => loggNavigering({ lenkeTekst: panelLinkText, destinasjon: e.view.document.location.href })}
            >
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
