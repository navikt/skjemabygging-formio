import { GuidePanel, Heading } from '@navikt/ds-react';

interface Props {
  title?: string;
  description?: string;
  className?: string;
}

const GuidPanel = ({ title, description, className }: Props) => {
  if (!title || !description) {
    return null;
  }

  return (
    <GuidePanel poster className={className}>
      <Heading level="2" size="small" spacing>
        {title}
      </Heading>
      {description}
    </GuidePanel>
  );
};

export default GuidPanel;
