import { BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import DownloadCoverPageAndApplicationButton from '../../components/button/DownloadCoverPageAndApplicationButton';
import NavigateButtonComponent from '../../components/button/navigation/pages/NavigateButtonComponent';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import makeStyles from '../../util/styles/jss/jss';

const useStyles = makeStyles({
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
});

export function PrepareIngenInnsendingPage() {
  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const { translate } = useLanguages();
  const styles = useStyles();
  const { form, submission } = useForm();

  return (
    <div className={styles.content}>
      <section aria-label={translate(form.properties.innsendingOverskrift)}>
        <Heading level="3" size="medium" spacing>
          {translate(form.properties.innsendingOverskrift)}
        </Heading>
        <BodyShort className="mb">{translate(form.properties.innsendingForklaring)}</BodyShort>
        <div className="mb-4">
          <DownloadCoverPageAndApplicationButton
            type="application"
            form={form}
            submission={submission}
            submissionMethod={'ingen'}
          >
            {translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
          </DownloadCoverPageAndApplicationButton>
        </div>
        <NavigateButtonComponent goBackUrl={`../oppsummering`} />
      </section>
    </div>
  );
}
