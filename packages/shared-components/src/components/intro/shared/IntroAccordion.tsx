import { Accordion } from '@navikt/ds-react';
import { ReactNode } from 'react';
import IntroBulletPoints from './IntroBulletPoints';
import IntroDescription from './IntroDescription';

interface Props {
  title?: string;
  description?: string;
  bulletPoints?: string[];
  contentBottom?: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const IntroAccordion = ({ title, description, bulletPoints, contentBottom, className, defaultOpen }: Props) => {
  if (!title) {
    return null;
  }

  return (
    <Accordion.Item className={className} defaultOpen={defaultOpen}>
      <Accordion.Header>{title}</Accordion.Header>
      <Accordion.Content>
        <IntroDescription description={description} />
        <IntroBulletPoints values={bulletPoints} />
        {contentBottom}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default IntroAccordion;
