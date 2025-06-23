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
}

const IntroAccordion = ({ title, description, bulletPoints, contentBottom, className }: Props) => {
  if (!title) {
    return null;
  }

  return (
    <Accordion.Item className={className}>
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
