import { Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';

interface Props {
  index: number;
  attachments: any[];
}

const LetterAddAttachment = ({ index, attachments }: Props) => {
  const { translate } = useLanguages();
  const { fyllutBaseURL } = useAppConfig();

  const skalSendeFlereVedlegg = attachments.length > 1;
  const attachmentSectionTitle = translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)
    .concat(' ')
    .concat(
      skalSendeFlereVedlegg
        ? translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleTheseAttachments)
        : translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleThisAttachment),
    );
  return (
    <section className="wizard-page" aria-label={`${index}. ${attachmentSectionTitle}`}>
      <Heading level="3" size="medium" spacing>
        {`${index}. ${attachmentSectionTitle}`}
      </Heading>
      <ul>
        {attachments.map((vedlegg) => (
          <li key={vedlegg.key}>
            {vedlegg.attachmentType === 'default' && vedlegg.properties?.vedleggskjema ? (
              <a
                href={`${fyllutBaseURL}/${vedlegg.properties.vedleggskjema}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translate(vedlegg.label)}
              </a>
            ) : (
              <>
                {translate(vedlegg.label)} {translate(TEXTS.common.opensInNewTab)}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default LetterAddAttachment;
