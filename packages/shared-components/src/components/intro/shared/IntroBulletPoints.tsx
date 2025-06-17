import { List } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import InnerHtmlShort from '../../inner-html/InnerHtmlShort';

interface Props {
  properties?: IntroPageSection;
}

const Section = ({ properties }: Props) => {
  const { translate } = useLanguages();
  if (!properties?.bulletPoints) {
    return null;
  }

  return (
    <List>
      {properties.bulletPoints.map((item, index) => (
        <List.Item key={index}>
          <InnerHtmlShort content={translate(item)} />
        </List.Item>
      ))}
    </List>
  );
};

export default Section;
