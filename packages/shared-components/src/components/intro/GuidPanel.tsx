import { GuidePanel, Heading } from '@navikt/ds-react';
import { useLanguages } from '../../context/languages';
import { InnerHtml } from '../../index';

interface Props {
  title?: string;
  description?: string;
  className?: string;
}

const GuidPanel = ({ title, description, className }: Props) => {
  const { translate } = useLanguages();
  if (!title || !description) {
    return null;
  }

  return (
    <GuidePanel poster className={className}>
      <Heading level="2" size="small" spacing>
        {translate(title)}
      </Heading>
      <InnerHtml content={translate(description)} />
    </GuidePanel>
  );
};

export default GuidPanel;
