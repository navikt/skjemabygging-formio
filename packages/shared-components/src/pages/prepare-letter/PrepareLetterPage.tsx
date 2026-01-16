import { Enhet, SubmissionType, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { getAttachments } from '../../../../shared-domain/src/forsteside/forstesideUtils';
import { fetchFilteredEnhetsliste } from '../../api/enhetsliste/fetchEnhetsliste';
import NavigateButtonComponent from '../../components/button/navigation/pages/NavigateButtonComponent';
import ErrorPage from '../../components/error/page/ErrorPage';
import LetterAddAttachment from '../../components/letter/LetterAddAttachment';
import LetterDownload from '../../components/letter/LetterDownload';
import LetterInTheMail from '../../components/letter/LetterInTheMail';
import LetterPrint from '../../components/letter/LetterPrint';
import LetterUXSignals from '../../components/letter/ux-signals/LetterUXSignals';
import LoadingComponent from '../../components/loading/LoadingComponent';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import FormMainContent from '../FormMainContent';

const submissionTypeIncludesPaperOrIsNoSubmission = (submissionTypes?: SubmissionType[]) =>
  submissionTypes &&
  (submissionTypesUtils.isNoneSubmission(submissionTypes) || submissionTypesUtils.isPaperSubmission(submissionTypes));

export function PrepareLetterPage() {
  useEffect(() => scrollToAndSetFocus('main', 'start'), []);
  const { baseUrl, logger, config } = useAppConfig();
  const { translate } = useLanguages();
  const [enhetsListe, setEnhetsListe] = useState<Enhet[]>([]);
  const [enhetsListeError, setEnhetsListeError] = useState(false);
  const [enhetslisteFilteringError, setEnhetslisteFilteringError] = useState(false);
  const { form, submission, setFormProgressVisible, setTitle } = useForm();

  const { enhetMaVelgesVedPapirInnsending, enhetstyper, skjemanummer, uxSignalsId, uxSignalsSubmissionTypes } =
    form.properties;
  const includeUxSignals = !!uxSignalsId && submissionTypeIncludesPaperOrIsNoSubmission(uxSignalsSubmissionTypes);

  useEffect(() => {
    if (enhetMaVelgesVedPapirInnsending && enhetstyper) {
      fetchFilteredEnhetsliste(baseUrl, enhetstyper)
        .then((enhetsliste) => {
          if (enhetsliste.length === 0) {
            setEnhetslisteFilteringError(true);
          }
          setEnhetsListe(enhetsliste);
        })
        .catch(() => setEnhetsListeError(true));
    }
  }, [baseUrl, enhetMaVelgesVedPapirInnsending, enhetstyper]);

  useEffect(() => {
    if (logger && enhetslisteFilteringError) {
      logger.error('Ingen relevante enheter funnet', { skjemanummer, enhetstyper });
    }
  }, [enhetslisteFilteringError, enhetstyper, logger, skjemanummer]);

  useEffect(() => {
    setFormProgressVisible(false);
    setTitle(TEXTS.statiske.prepareLetterPage.subTitle);
  }, [setFormProgressVisible, setTitle]);

  if (enhetMaVelgesVedPapirInnsending && enhetsListeError) {
    return <ErrorPage errorMessage={translate(TEXTS.statiske.prepareLetterPage.entityFetchError)} />;
  }

  if (enhetMaVelgesVedPapirInnsending && enhetsListe === undefined) {
    return <LoadingComponent />;
  }

  const attachments = submission?.data ? getAttachments(submission?.data, form) : [];
  const hasAttachments = attachments.length > 0;

  return (
    <>
      <FormMainContent>
        <LetterDownload index={1} enhetsListe={enhetsListe} />
        <LetterPrint index={2} />
        {hasAttachments && <LetterAddAttachment index={3} attachments={attachments} />}
        <LetterInTheMail index={hasAttachments ? 4 : 3} attachments={attachments} />
      </FormMainContent>
      <NavigateButtonComponent goBackUrl="../oppsummering" />
      {includeUxSignals && <LetterUXSignals id={uxSignalsId} demo={config?.NAIS_CLUSTER_NAME !== 'prod-gcp'} />}
    </>
  );
}
