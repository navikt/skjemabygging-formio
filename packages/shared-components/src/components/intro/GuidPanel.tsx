import { GuidePanel, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  description?: string;
  className?: string;
}

const GuidPanel = ({ description, className }: Props) => {
  const { translate } = useLanguages();
  if (!description) {
    return null;
  }

  // TODO: Add support for TEXTS.grensesnitt.introPage.guidePanel.hiPersonalized when we have user data available
  return (
    <GuidePanel poster className={className}>
      <Heading level="2" size="small" spacing>
        {translate(TEXTS.grensesnitt.introPage.guidePanel.hi)}
      </Heading>
      <InnerHtmlLong content={translate(description)} />
    </GuidePanel>
  );
};

export default GuidPanel;
