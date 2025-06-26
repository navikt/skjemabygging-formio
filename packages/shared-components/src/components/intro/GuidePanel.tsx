import { GuidePanel as AkselGuidePanel, Heading } from '@navikt/ds-react';
import { Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  description?: string;
  translate: (key?: string) => string;
  className?: string;
}

const GuidePanel = ({ description, translate, className }: Props) => {
  if (!description) {
    return null;
  }

  // TODO: Add support for introPage.guidePanel.hiPersonalized when we have user data available
  const heading: Tkey = 'introPage.guidePanel.hi';

  return (
    <AkselGuidePanel poster className={className}>
      <Heading level="2" size="small" spacing>
        {translate(heading)}
      </Heading>
      <InnerHtmlLong content={translate(description)} />
    </AkselGuidePanel>
  );
};

export default GuidePanel;
