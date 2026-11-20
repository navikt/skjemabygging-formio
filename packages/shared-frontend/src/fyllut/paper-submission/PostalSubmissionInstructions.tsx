import { Link } from '@navikt/ds-react';
import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import SharedPostalSubmissionInstructions from '../../components/postal-submission-instructions/PostalSubmissionInstructions';
import { useLanguage } from '../../context/language/LanguageContext';
import { useIntegration } from '../context/integration/IntegrationContext';

interface Props {
  attachments: Component[];
  children: ReactNode;
}

const PostalSubmissionInstructions = ({ attachments, children }: Props) => {
  const { translate } = useLanguage();
  const { fyllutBaseUrl } = useIntegration();

  return (
    <SharedPostalSubmissionInstructions
      introduction={translate(TEXTS.statiske.prepareLetterPage.firstDescription)}
      download={{ title: translate(TEXTS.grensesnitt.downloadApplication), content: children }}
      print={{
        title: translate(TEXTS.statiske.prepareLetterPage.printFormTitle),
        description: translate(TEXTS.statiske.prepareLetterPage.printFormDescription),
      }}
      attachments={attachments.map((attachment) => ({
        key: attachment.key,
        content:
          attachment.attachmentType === 'default' && attachment.properties?.vedleggskjema ? (
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
          ),
      }))}
      mailingDescription={translate(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction)}
    />
  );
};

export default PostalSubmissionInstructions;
