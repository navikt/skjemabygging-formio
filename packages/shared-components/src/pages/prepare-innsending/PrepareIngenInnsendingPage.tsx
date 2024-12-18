import { BodyShort, Heading } from '@navikt/ds-react';
import { formSummaryUtil, Submission, SummaryPanel, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import DownloadPdfButton from '../../components/button/download-pdf/DownloadPdfButton';
import NavigateButtonComponent from '../../components/button/navigation/pages/NavigateButtonComponent';
import { useAmplitude } from '../../context/amplitude';
import { useAppConfig } from '../../context/config/configContext';
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

const createSummaryPanels = (form, submission, translate, lang): SummaryPanel[] => {
  return formSummaryUtil.createFormSummaryPanels(form, submission, translate, true, lang);
};

export function PrepareIngenInnsendingPage({ form, submission, translations, formUrl }: Props) {
  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const { fyllutBaseURL } = useAppConfig();
  const { translate } = useLanguages();
  const { loggSkjemaFullfort } = useAmplitude();
  const styles = useStyles();
  const { currentLanguage } = useLanguages();

  return (
    <div className={styles.content}>
      <section id="maincontent" className="fyllut-layout" tabIndex={-1}>
        <section className="main-col" aria-label={translate(form.properties.innsendingOverskrift)}>
          <div className="wizard-page">
            <Heading level="3" size="medium" spacing>
              {translate(form.properties.innsendingOverskrift)}
            </Heading>
            <BodyShort className="mb">{translate(form.properties.innsendingForklaring)}</BodyShort>
            <DownloadPdfButton
              id={`soknad-${form.path}`}
              values={{
                form: JSON.stringify(form),
                submission: JSON.stringify(submission),
                translations: JSON.stringify(currentLanguage !== 'nb-NO' ? translations[currentLanguage] : {}),
                language: currentLanguage,
                summaryPanels: JSON.stringify(createSummaryPanels(form, submission, translate, currentLanguage)),
              }}
              actionUrl={`${fyllutBaseURL}/api/pdf/convert`}
              label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
              onSubmit={() => loggSkjemaFullfort()}
              submissionMethod="ingen"
            />
          </div>
          <NavigateButtonComponent translate={translate} goBackUrl={`${formUrl}/oppsummering`} />
        </section>
      </section>
    </div>
  );
}
