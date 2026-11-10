import { BodyShort } from '@navikt/ds-react';
import {
  attachmentUtils,
  formioFormsApiUtils,
  submissionTypesUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFormDefinitionForm } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useIntegration } from '../context/integration/IntegrationContext';
import { SUMMARY_KEY } from '../form-flow/constants';
import { FormButtonRow, FormPrevButton } from '../layout/FormButtonRow';
import FormHeader from '../layout/FormHeader';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import ApplicationDownloadSection from './ApplicationDownloadSection';
import styles from './PaperSubmissionPage.module.css';
import PostalSubmissionInstructions from './PostalSubmissionInstructions';

interface Props {
  documentType: 'application' | 'application-with-cover-page';
}

const PaperSubmissionPage = ({ documentType }: Props) => {
  const { translate } = useLanguage();
  const { renderFeedback } = useIntegration();
  const form = useFormDefinitionForm();
  const { submission } = useSubmissionState();
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const navForm = useMemo(() => formioFormsApiUtils.mapFormToNavForm(form), [form]);
  const attachments = useMemo(
    () => (submission ? attachmentUtils.getAttachmentsForCoverPage(submission, navForm) : []),
    [navForm, submission],
  );
  const showNoSubmissionContent = documentType === 'application';
  const { uxSignalsId, uxSignalsSubmissionTypes } = form.properties;
  const showFeedback =
    !showNoSubmissionContent &&
    uxSignalsId &&
    uxSignalsSubmissionTypes &&
    (submissionTypesUtils.isPaperNoCoverPageSubmission(uxSignalsSubmissionTypes) ||
      submissionTypesUtils.isPaperSubmission(uxSignalsSubmissionTypes));

  return (
    <>
      <FormHeader
        form={form}
        pageTitle={
          showNoSubmissionContent ? form.properties.innsendingOverskrift : TEXTS.statiske.prepareLetterPage.subTitle
        }
      />
      {showNoSubmissionContent ? (
        <>
          <BodyShort className={styles.description}>{translate(form.properties.innsendingForklaring)}</BodyShort>
          <div className={styles.download}>
            <ApplicationDownloadSection documentType={documentType} />
          </div>
        </>
      ) : (
        <PostalSubmissionInstructions attachments={attachments}>
          <ApplicationDownloadSection documentType={documentType} />
        </PostalSubmissionInstructions>
      )}
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton exitOnly />}
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() => navigate({ pathname: `../${SUMMARY_KEY}`, search }, { state })}
          />
        }
      />
      {showFeedback && renderFeedback?.(uxSignalsId)}
    </>
  );
};

export default PaperSubmissionPage;
