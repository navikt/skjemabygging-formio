import { BodyShort, Heading } from '@navikt/ds-react';
import { Enhet, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../../context/languages';
import DownloadFrontPageAndApplicationButton from '../../button/DownloadFrontPageAndApplicationButton';
import EnhetSelector from '../../select/enhet/EnhetSelector';

interface Props {
  index: number;
  form: NavFormType;
  submission: any;
  enhetsListe: Enhet[];
  translations: any;
}

const LetterDownload = ({ form, index, submission, enhetsListe, translations }: Props) => {
  const { translate } = useLanguages();
  const [selectedEnhetNummer, setSelectedEnhetNummer] = useState<string | null>(null);
  const [isRequiredEnhetMissing, setIsRequiredEnhetMissing] = useState(false);

  return (
    <section
      className="wizard-page"
      aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.firstSectionTitle)}`}
    >
      <Heading level="3" size="medium" spacing>
        {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.firstSectionTitle)}`}
      </Heading>
      <BodyShort className="mb-4">{translate(TEXTS.statiske.prepareLetterPage.firstDescription)}</BodyShort>
      <EnhetSelector
        enhetsliste={enhetsListe}
        onSelectEnhet={(enhetNummer) => {
          setSelectedEnhetNummer(enhetNummer);
          setIsRequiredEnhetMissing(false);
        }}
        error={isRequiredEnhetMissing ? translate(TEXTS.statiske.prepareLetterPage.entityNotSelectedError) : undefined}
      />

      <DownloadFrontPageAndApplicationButton
        formPath={form.path}
        form={form}
        submission={submission}
        enhetNummer={selectedEnhetNummer ?? undefined}
        translations={translations}
        isValid={() => {
          if (enhetsListe.length > 0 && !selectedEnhetNummer) {
            setIsRequiredEnhetMissing(true);
            return false;
          }
          return true;
        }}
      >
        {translate(TEXTS.grensesnitt.prepareLetterPage.downloadCoverPage)}
      </DownloadFrontPageAndApplicationButton>
    </section>
  );
};

export default LetterDownload;
