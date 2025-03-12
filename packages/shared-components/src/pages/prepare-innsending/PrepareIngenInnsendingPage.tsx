import { BodyShort, Heading } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import DownloadApplicationButton from '../../components/button/DownloadApplicationButton';
import NavigateButtonComponent from '../../components/button/navigation/pages/NavigateButtonComponent';
import { useLanguages } from '../../context/languages';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import makeStyles from '../../util/styles/jss/jss';

export interface Props {
  form: any;
  submission: Submission;
  translations: { [key: string]: string } | object;
  formUrl: string;
}

const useStyles = makeStyles({
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
});

export function PrepareIngenInnsendingPage({ form, submission, translations, formUrl }: Props) {
  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const { translate } = useLanguages();
  const styles = useStyles();

  return (
    <div className={styles.content}>
      <section id="maincontent" className="fyllut-layout" tabIndex={-1}>
        <section className="main-col" aria-label={translate(form.properties.innsendingOverskrift)}>
          <div className="wizard-page">
            <Heading level="3" size="medium" spacing>
              {translate(form.properties.innsendingOverskrift)}
            </Heading>
            <BodyShort className="mb">{translate(form.properties.innsendingForklaring)}</BodyShort>
            <DownloadApplicationButton
              formPath={form.path}
              form={form}
              submission={submission}
              translations={translations}
              submissionMethod={'ingen'}
            >
              {translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
            </DownloadApplicationButton>
          </div>
          <NavigateButtonComponent translate={translate} goBackUrl={`${formUrl}/oppsummering`} />
        </section>
      </section>
    </div>
  );
}
