import { BodyShort, Heading } from '@navikt/ds-react';
import { Enhet, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import DownloadCoverPageAndApplicationButton from '../button/DownloadCoverPageAndApplicationButton';
import EnhetSelector from '../select/enhet/EnhetSelector';

interface Props {
  index: number;
  form: NavFormType;
  submission: any;
  enhetsListe: Enhet[];
}

const LetterDownload = ({ form, index, submission, enhetsListe }: Props) => {
  const { translate } = useLanguages();
  const [selectedEnhetNummer, setSelectedEnhetNummer] = useState<string | null>(null);
  const [isRequiredEnhetMissing, setIsRequiredEnhetMissing] = useState(false);

  return (
    <section className="wizard-page" aria-label={`${index}. ${translate(TEXTS.grensesnitt.downloadApplication)}`}>
      <BodyShort className="mb-4">{translate(TEXTS.statiske.prepareLetterPage.firstDescription)}</BodyShort>
      <Heading level="3" size="medium" spacing>
        {`${index}. ${translate(TEXTS.grensesnitt.downloadApplication)}`}
      </Heading>
      <EnhetSelector
        enhetsliste={enhetsListe}
        onSelectEnhet={(enhetNummer) => {
          setSelectedEnhetNummer(enhetNummer);
          setIsRequiredEnhetMissing(false);
        }}
        error={isRequiredEnhetMissing ? translate(TEXTS.statiske.prepareLetterPage.entityNotSelectedError) : undefined}
      />

      <DownloadCoverPageAndApplicationButton
        form={form}
        submission={submission}
        enhetNummer={selectedEnhetNummer ?? undefined}
        isValid={() => {
          if (enhetsListe.length > 0 && !selectedEnhetNummer) {
            setIsRequiredEnhetMissing(true);
            return false;
          }
          return true;
        }}
      >
        {translate(TEXTS.grensesnitt.downloadApplication)}
      </DownloadCoverPageAndApplicationButton>
    </section>
  );
};

export default LetterDownload;
