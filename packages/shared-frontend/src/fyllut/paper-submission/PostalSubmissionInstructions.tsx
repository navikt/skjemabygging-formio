import { BodyShort, Heading, Link, List, VStack } from '@navikt/ds-react';
import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useIntegration } from '../context/integration/IntegrationContext';
import styles from './PostalSubmissionInstructions.module.css';

interface Props {
  attachments: Component[];
  children: ReactNode;
}

const PostalSubmissionInstructions = ({ attachments, children }: Props) => {
  const { translate } = useLanguage();
  const { fyllutBaseUrl } = useIntegration();
  const hasAttachments = attachments.length > 0;
  const attachmentSectionTitle = `${translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)} ${translate(
    hasAttachments && attachments.length > 1
      ? TEXTS.statiske.prepareLetterPage.attachmentSectionTitleTheseAttachments
      : TEXTS.statiske.prepareLetterPage.attachmentSectionTitleThisAttachment,
  )}`;
  const mailingSectionTitle = translate(
    hasAttachments
      ? TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitleWithAttachment
      : TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle,
  );

  return (
    <VStack gap="space-16" className={styles.instructions}>
      <section aria-labelledby="postal-download-title">
        <BodyShort className={styles.introduction}>
          {translate(TEXTS.statiske.prepareLetterPage.firstDescription)}
        </BodyShort>
        <Heading id="postal-download-title" level="3" size="medium" spacing>
          1. {translate(TEXTS.grensesnitt.downloadApplication)}
        </Heading>
        {children}
      </section>
      <section aria-labelledby="postal-print-title">
        <Heading id="postal-print-title" level="3" size="medium" spacing>
          2. {translate(TEXTS.statiske.prepareLetterPage.printFormTitle)}
        </Heading>
        <BodyShort>{translate(TEXTS.statiske.prepareLetterPage.printFormDescription)}</BodyShort>
      </section>
      {hasAttachments && (
        <section aria-labelledby="postal-attachments-title">
          <Heading id="postal-attachments-title" level="3" size="medium" spacing>
            3. {attachmentSectionTitle}
          </Heading>
          <List>
            {attachments.map((attachment) => (
              <List.Item key={attachment.key}>
                {attachment.attachmentType === 'default' && attachment.properties?.vedleggskjema ? (
                  <>
                    <Link
                      href={`${fyllutBaseUrl}/${attachment.properties.vedleggskjema}?sub=papernocoverpage`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {translate(attachment.label)}
                    </Link>{' '}
                    <span>{translate(TEXTS.common.opensInNewTab)}</span>
                  </>
                ) : (
                  translate(attachment.label)
                )}
              </List.Item>
            ))}
          </List>
        </section>
      )}
      <section aria-labelledby="postal-mail-title">
        <Heading id="postal-mail-title" level="3" size="medium" spacing>
          {hasAttachments ? 4 : 3}. {mailingSectionTitle}
        </Heading>
        <BodyShort>{translate(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction)}</BodyShort>
      </section>
    </VStack>
  );
};

export default PostalSubmissionInstructions;
