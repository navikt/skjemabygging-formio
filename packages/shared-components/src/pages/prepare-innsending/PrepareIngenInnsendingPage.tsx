import { BodyShort } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import DownloadCoverPageAndApplicationButton from '../../components/button/DownloadCoverPageAndApplicationButton';
import NavigateButtonComponent from '../../components/button/navigation/pages/NavigateButtonComponent';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import FormMainContent from '../FormMainContent';

export function PrepareIngenInnsendingPage() {
  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const { translate } = useLanguages();
  const { form, formUrl, setFormProgressVisible, setTitle } = useForm();

  useEffect(() => {
    setFormProgressVisible(false);
    setTitle(form.properties.innsendingOverskrift);
  }, [form, setFormProgressVisible, setTitle]);

  return (
    <>
      <FormMainContent>
        <BodyShort className="mb">{translate(form.properties.innsendingForklaring)}</BodyShort>
        <div className="mb-4">
          <DownloadCoverPageAndApplicationButton type="application">
            {translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
          </DownloadCoverPageAndApplicationButton>
        </div>
      </FormMainContent>
      <NavigateButtonComponent goBackUrl={`${formUrl}/oppsummering`} />
    </>
  );
}
