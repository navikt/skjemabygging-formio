import { Accordion, Box, List } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { InnerHtml, InnerHtmlLong } from '../Html';

const IntroDescription = ({ description }: { description?: string }) =>
  description ? <InnerHtmlLong content={description} spacing /> : null;

const IntroBulletPoints = ({ values }: { values?: string[] }) => {
  if (!values?.length) {
    return null;
  }

  return (
    <Box marginBlock="space-16" asChild>
      <List data-aksel-migrated-v8>
        {values.map((item, index) => (
          <List.Item key={index}>
            <InnerHtml content={item} />
          </List.Item>
        ))}
      </List>
    </Box>
  );
};

interface IntroAccordionProps {
  title?: string;
  description?: string;
  bulletPoints?: string[];
  contentBottom?: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const IntroAccordion = ({
  title,
  description,
  bulletPoints,
  contentBottom,
  className,
  defaultOpen,
}: IntroAccordionProps) => {
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

export { IntroAccordion, IntroBulletPoints, IntroDescription };
