import { BodyShort, Heading, List, VStack } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './PostalSubmissionInstructions.module.css';

interface Props {
  introduction: string;
  download: { title: string; content: ReactNode };
  print: { title: string; description: string };
  attachments: { title: string; description?: string; items: { key: string; content: ReactNode }[] };
  mailing: { title: string; description: string };
}

const PostalSubmissionInstructions = ({ introduction, download, print, attachments, mailing }: Props) => {
  const hasAttachments = attachments.items.length > 0 || Boolean(attachments.description);
  return (
    <VStack gap="space-16" className={styles.instructions}>
      <section aria-labelledby="postal-download-title">
        <BodyShort className={styles.introduction}>{introduction}</BodyShort>
        <Heading id="postal-download-title" level="3" size="medium" spacing>
          1. {download.title}
        </Heading>
        {download.content}
      </section>
      <section aria-labelledby="postal-print-title">
        <Heading id="postal-print-title" level="3" size="medium" spacing>
          2. {print.title}
        </Heading>
        <BodyShort>{print.description}</BodyShort>
      </section>
      {hasAttachments && (
        <section aria-labelledby="postal-attachments-title">
          <Heading id="postal-attachments-title" level="3" size="medium" spacing>
            3. {attachments.title}
          </Heading>
          {attachments.description && <BodyShort>{attachments.description}</BodyShort>}
          {attachments.items.length > 0 && (
            <List>
              {attachments.items.map(({ key, content }) => (
                <List.Item key={key}>{content}</List.Item>
              ))}
            </List>
          )}
        </section>
      )}
      <section aria-labelledby="postal-mail-title">
        <Heading id="postal-mail-title" level="3" size="medium" spacing>
          {hasAttachments ? 4 : 3}. {mailing.title}
        </Heading>
        <BodyShort>{mailing.description}</BodyShort>
      </section>
    </VStack>
  );
};

export default PostalSubmissionInstructions;
