import { Heading } from '@navikt/ds-react';
import { Enhet, NavFormType, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { fetchEnhetsliste, isEnhetSupported } from '../../api/enhetsliste/fetchEnhetsliste';
import NavigateButtonComponent from '../../components/button/navigation/pages/NavigateButtonComponent';
import ErrorPage from '../../components/error/page/ErrorPage';
import LetterAddAttachment from '../../components/letter/add-attachment/LetterAddAttachment';
import LetterDownload from '../../components/letter/download/LetterDownload';
import LetterInTheMail from '../../components/letter/in-the-mail/LetterInTheMail';
import LetterUXSignals from '../../components/letter/ux-signals/LetterUXSignals';
import LoadingComponent from '../../components/loading/LoadingComponent';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import { getVedleggsFelterSomSkalSendes } from '../../util/forsteside/forsteside';
import makeStyles from '../../util/styles/jss/jss';

const compareEnheter = (enhetA, enhetB) => enhetA.navn.localeCompare(enhetB.navn, 'nb');

interface Props {
  form: NavFormType;
  submission: Submission;
  translations: any;
  formUrl: string;
}

const useStyles = makeStyles({
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& section.wizard-page': {
      paddingBottom: '2rem',
    },
  },
});

export function PrepareLetterPage({ form, submission, translations, formUrl }: Props) {
  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const { fyllutBaseURL, baseUrl, logger } = useAppConfig();
  const { translate } = useLanguages();
  const [enhetsListe, setEnhetsListe] = useState<Enhet[]>([]);
  const [enhetsListeError, setEnhetsListeError] = useState(false);
  const [enhetslisteFilteringError, setEnhetslisteFilteringError] = useState(false);

  const styles = useStyles();

  const { enhetMaVelgesVedPapirInnsending, enhetstyper, skjemanummer } = form.properties;

  useEffect(() => {
    if (enhetMaVelgesVedPapirInnsending) {
      fetchEnhetsliste(baseUrl)
        .then((enhetsliste) => {
          const filteredList = enhetsliste.filter(isEnhetSupported(enhetstyper!)).sort(compareEnheter);
          if (filteredList.length === 0) {
            setEnhetslisteFilteringError(true);
            return enhetsliste.sort(compareEnheter);
          }
          return filteredList;
        })
        .then(setEnhetsListe)
        .catch(() => setEnhetsListeError(true));
    }
  }, [baseUrl, enhetMaVelgesVedPapirInnsending, enhetstyper]);

  useEffect(() => {
    if (logger && enhetslisteFilteringError) {
      logger.error('Ingen relevante enheter funnet', { skjemanummer, enhetstyper });
    }
  }, [enhetslisteFilteringError, enhetstyper, logger, skjemanummer]);

  if (enhetMaVelgesVedPapirInnsending && enhetsListeError) {
    return <ErrorPage errorMessage={translate(TEXTS.statiske.prepareLetterPage.entityFetchError)} />;
  }

  if (enhetMaVelgesVedPapirInnsending && enhetsListe === undefined) {
    return <LoadingComponent />;
  }

  const attachments = getVedleggsFelterSomSkalSendes(submission.data, form);
  const hasAttachments = attachments.length > 0;

  return (
    <div className={styles.content}>
      <Heading level="2" size="large" spacing>
        {translate(TEXTS.statiske.prepareLetterPage.subTitle)}
      </Heading>
      <section className="fyllut-layout" id="maincontent" tabIndex={-1}>
        <section className="main-col">
          <LetterDownload
            index={1}
            form={form}
            submission={submission}
            enhetsListe={enhetsListe}
            fyllutBaseURL={fyllutBaseURL}
            translate={translate}
            translations={translations}
          />
          {hasAttachments && <LetterAddAttachment index={2} vedleggSomSkalSendes={attachments} translate={translate} />}
          <LetterInTheMail index={hasAttachments ? 3 : 2} vedleggSomSkalSendes={attachments} translate={translate} />
          <NavigateButtonComponent translate={translate} goBackUrl={`${formUrl}/oppsummering`} />
          {
            // TODO: If the UXSignal pilot is successful, the study code should be a new setting on the form.
            skjemanummer === 'NAV 08-09.06' && <LetterUXSignals code="study-dont9j6txe" />
          }
        </section>
      </section>
    </div>
  );
}

PrepareLetterPage.propTypes = {
  form: PropTypes.object.isRequired,
  submission: PropTypes.object.isRequired,
};
