import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, HStack, Link, List } from '@navikt/ds-react';
import { dateUtils, ReceiptSummary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './ReceiptPage.module.css';

interface Props {
  receipt: ReceiptSummary;
  pdfUrl?: string;
  onDownload: () => void;
}

const ReceiptReceivedDocuments = ({ receipt, pdfUrl, onDownload }: Props) => {
  const { translate } = useLanguage();

  return (
    <section>
      <BodyShort size="large">
        <b>
          {translate(TEXTS.statiske.receipt.documentsReceivedHeading, {
            date: dateUtils.toLocaleDate(receipt.receivedDate),
          })}
        </b>
      </BodyShort>
      <Box marginBlock="space-16" asChild>
        <List className={styles.printList}>
          <List.Item icon={<CheckmarkCircleFillIcon className={styles.successIcon} fontSize="1.5rem" aria-hidden />}>
            <HStack gap="space-8">
              {receipt.title}
              {pdfUrl && (
                <Link
                  className={`${styles.downloadLink} ${styles.hideOnPrint}`}
                  href={pdfUrl}
                  underline={false}
                  target="_blank"
                  onClick={onDownload}
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden className={styles.downloadLinkIcon} />
                  <span>{translate(TEXTS.statiske.receipt.downloadLinkLabel)}</span>
                </Link>
              )}
            </HStack>
          </List.Item>
          {receipt.receivedAttachments.map((attachment, index) => (
            <List.Item
              key={`${attachment.id}-${index}`}
              icon={<CheckmarkCircleFillIcon className={styles.successIcon} fontSize="1.5rem" aria-hidden />}
            >
              {attachment.title}
            </List.Item>
          ))}
        </List>
      </Box>
    </section>
  );
};

export default ReceiptReceivedDocuments;
