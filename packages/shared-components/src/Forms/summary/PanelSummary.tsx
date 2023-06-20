import { Accordion, Heading } from "@navikt/ds-react";
import { Summary, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Link, useLocation } from "react-router-dom";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import makeStyles from "../../util/jss";
import ComponentSummary from "./ComponentSummary";

interface Props {
  component: Summary.Panel;
  formUrl: string;
}

const panelStyles = makeStyles({
  link: {
    display: "block",
    marginBottom: "2rem",
  },
});

const PanelSummary = ({ component, formUrl }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { link } = panelStyles();
  const { key, label, components } = component;
  const panelLinkText = `${translate(TEXTS.grensesnitt.summaryPage.edit)} ${label.toLowerCase()}`;
  return (
    <section>
      <Accordion>
        <Accordion.Item defaultOpen={true}>
          <Accordion.Header>
            {" "}
            <Heading level="3" size="medium">
              {label}
            </Heading>
          </Accordion.Header>
          <Accordion.Content>
            <Link
              to={{ pathname: `${formUrl}/${key}`, search }}
              className={link}
              onClick={(e) => loggNavigering({ lenkeTekst: panelLinkText, destinasjon: e.view.location.href })}
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
