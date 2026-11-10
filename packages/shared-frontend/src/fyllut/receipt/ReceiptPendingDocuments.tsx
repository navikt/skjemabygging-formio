import { BodyShort, Box, List } from '@navikt/ds-react';
import { ReceiptSummary } from '@navikt/skjemadigitalisering-shared-domain';
import styles from './ReceiptPage.module.css';

interface Props {
  heading: string;
  attachments: ReceiptSummary['attachmentsToSendLater'];
}

const ReceiptPendingDocuments = ({ heading, attachments }: Props) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <section>
      <BodyShort size="large">
        <b>{heading}</b>
      </BodyShort>
      <Box marginBlock="space-16" asChild>
        <List className={styles.printList}>
          {attachments.map((attachment, index) => (
            <List.Item key={`${attachment.id}-${index}`}>{attachment.title}</List.Item>
          ))}
        </List>
      </Box>
    </section>
  );
};

export default ReceiptPendingDocuments;
