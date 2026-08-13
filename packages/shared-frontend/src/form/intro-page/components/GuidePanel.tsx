import { GuidePanel as AkselGuidePanel, Heading } from '@navikt/ds-react';
import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { InnerHtmlLong } from '../../fyllut-components/Html';

interface Props {
  description?: string;
  translate: TranslateFunction;
  className?: string;
}

const GuidePanel = ({ description, translate, className }: Props) => {
  if (!description) {
    return null;
  }

  return (
    <AkselGuidePanel poster className={className}>
      <Heading level="2" size="small" spacing>
        {translate('introPage.guidePanel.hi')}
      </Heading>
      <InnerHtmlLong content={translate(description)} />
    </AkselGuidePanel>
  );
};

export default GuidePanel;
