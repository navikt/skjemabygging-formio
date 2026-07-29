import { Accordion, List } from '@navikt/ds-react';
import { ReactNode } from 'react';
import RichText from './RichText';

const IntroAccordion = ({
  title,
  description,
  bulletPoints,
  contentBottom,
}: {
  title?: string;
  description?: string;
  bulletPoints?: string[];
  contentBottom?: ReactNode;
}) => {
  if (!title) {
    return null;
  }

  return (
    <Accordion.Item>
      <Accordion.Header>{title}</Accordion.Header>
      <Accordion.Content>
        <RichText content={description} />
        {!!bulletPoints?.length && (
          <List data-aksel-migrated-v8>
            {bulletPoints.map((bulletPoint, index) => (
              <List.Item key={`${bulletPoint}-${index}`}>
                <RichText content={bulletPoint} />
              </List.Item>
            ))}
          </List>
        )}
        {contentBottom}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default IntroAccordion;
