import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, HStack, Link, List } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';

const ReceiptDocuments = ({
  receipt,
  pdfUrl,
  onPdfDownloaded,
}: {
  receipt: { title: string; receivedDate: string; receivedAttachments: Array<{ id: string; title: string }> };
  pdfUrl?: string;
  onPdfDownloaded?: () => void;
}) => {
  const { translate } = useLanguage();
  const successIcon = (
    <CheckmarkCircleFillIcon
      color="currentColor"
      style={{ color: 'var(--ax-text-success-decoration)' }}
      fontSize="1.5rem"
      aria-hidden
    />
  );

  return (
    <section>
      <BodyShort size="large">
        <strong>
          {translate(TEXTS.statiske.receipt.documentsReceivedHeading, {
            date: receipt.receivedDate,
          })}
        </strong>
      </BodyShort>
      <Box marginBlock="space-16" asChild>
        <List data-aksel-migrated-v8>
          <List.Item icon={successIcon}>
            <HStack gap="space-8">
              {receipt.title}
              {pdfUrl && (
                <Link
                  href={pdfUrl}
                  underline={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onPdfDownloaded}
                >
                  <DownloadIcon aria-hidden fontSize="1.5rem" />
                  <span>{translate(TEXTS.statiske.receipt.downloadLinkLabel)}</span>
                </Link>
              )}
            </HStack>
          </List.Item>
          {receipt.receivedAttachments.map((attachment) => (
            <List.Item key={attachment.id} icon={successIcon}>
              {attachment.title}
            </List.Item>
          ))}
        </List>
      </Box>
    </section>
  );
};

export default ReceiptDocuments;
