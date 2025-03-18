import { BodyShort, Heading } from '@navikt/ds-react';
import { Enhet, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../../context/languages';
import DownloadPdfButton from '../../button/download-pdf/DownloadPdfButton';
import EnhetSelector from '../../select/enhet/EnhetSelector';

interface Props {
  index: number;
  form: NavFormType;
  submission: any;
  enhetsListe: Enhet[];
  fyllutBaseURL?: string;
  translate: any;
  translations: any;
}

const LetterDownload = ({ form, index, submission, enhetsListe, fyllutBaseURL, translate, translations }: Props) => {
  const [selectedEnhetNummer, setSelectedEnhetNummer] = useState<string | null>(null);
  const [isRequiredEnhetMissing, setIsRequiredEnhetMissing] = useState(false);
  const { currentLanguage } = useLanguages();

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

      <DownloadPdfButton
        id={`forsteside-${form.path}`}
        values={{
          form: JSON.stringify(form),

          submission: JSON.stringify(submission),
          translations: JSON.stringify(currentLanguage !== 'nb-NO' ? translations[currentLanguage] : {}),

          language: currentLanguage,
          enhetNummer: selectedEnhetNummer,
          version: 'v3',
        }}
        actionUrl={`${fyllutBaseURL}/api/foersteside-soknad`}
        label={translate(TEXTS.grensesnitt.prepareLetterPage.downloadCoverPage)}
        onSubmit={(event) => {
          if (enhetsListe.length > 0 && !selectedEnhetNummer) {
            event.preventDefault();
            setIsRequiredEnhetMissing(true);
          }
        }}
      />
    </section>
  );
};

export default LetterDownload;
