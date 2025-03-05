import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { NavFormType, Submission, TEXTS, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppConfig } from '../../../context/config/configContext';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { hasRelevantAttachments } from '../../../util/attachment/attachmentsUtil';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import makeStyles from '../../../util/styles/jss/jss';
import urlUtils from '../../../util/url/url';
import DigitalSubmissionButton from '../../button/navigation/digital-submission/DigitalSubmissionButton';
import EditAnswersButton from '../../button/navigation/edit-answers/EditAnswersButton';
import SaveAndDeleteButtons from '../../button/navigation/save-and-delete/SaveAndDeleteButtons';
import LinkButton from '../../link-button/LinkButton';
import ConfirmationModal from '../../modal/confirmation/ConfirmationModal';
import DigitalSubmissionWithPrompt from '../../submission/DigitalSubmissionWithPrompt';

export interface Props {
  form: NavFormType;
  submission?: Submission;
  formUrl: string;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
}

const useStyles = makeStyles({
  navigationDetail: {
    display: 'flex',
    justifyContent: 'center',
  },
});

const SummaryPageNavigation = ({ form, submission, formUrl, panelValidationList, isValid }: Props) => {
  const { submissionMethod, app } = useAppConfig();
  const { search } = useLocation();
  const { translate } = useLanguages();
  const { mellomlagringError, isMellomlagringActive } = useSendInn();
  const [error, setError] = useState<Error>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const submissionTypes = form.properties.submissionTypes;
  const { isNoneSubmission } = submissionTypesUtils;
  const styles = useStyles();
  const hasAttachments = hasRelevantAttachments(form, submission?.data ?? {});
  const canSubmit =
    !!panelValidationList && panelValidationList.every((panelValidation) => !panelValidation.hasValidationErrors);
  const { isPaperSubmission, isPaperSubmissionOnly, isDigitalSubmissionOnly } = submissionTypesUtils;
  const sendIPosten =
    (isPaperSubmission(submissionTypes) && (submissionMethod === 'paper' || app === 'bygger')) ||
    isPaperSubmissionOnly(submissionTypes);

  const exitUrl = urlUtils.getExitUrl(window.location.href);

  return (
    <>
      {mellomlagringError && (
        <Alert variant="error" className="mb">
          <Heading size="small" level="4">
            {translate(mellomlagringError.title)}
          </Heading>
          {mellomlagringError.linkText && (
            <p>
              {translate(mellomlagringError.messageStart)}
              <a href={translate(mellomlagringError.url)}>{translate(mellomlagringError.linkText)}</a>
              {translate(mellomlagringError.messageEnd)}
            </p>
          )}
          {translate(mellomlagringError.message, mellomlagringError?.messageParams)}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb" data-testid="error-message">
          {error.message}
        </Alert>
      )}

      {submission?.fyllutState?.mellomlagring?.savedDate && (
        <p
          className={styles.navigationDetail}
        >{`${TEXTS.grensesnitt.mostRecentSave} ${submission.fyllutState?.mellomlagring?.savedDate}`}</p>
      )}

      <nav>
        <div className="button-row">
          {sendIPosten && (
            <LinkButton
              buttonVariant="primary"
              onClick={(e) => !isValid(e)}
              to={{ pathname: `${formUrl}/send-i-posten`, search }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.moveForward)}
              </span>
              <span className="navds-button__icon">
                <ArrowRightIcon aria-hidden />
              </span>
            </LinkButton>
          )}
          {canSubmit &&
            (submissionMethod === 'digital' || isDigitalSubmissionOnly(submissionTypes)) &&
            (hasAttachments ? (
              <DigitalSubmissionButton
                withIcon
                submission={submission}
                isValid={isValid}
                onError={(err) => {
                  setError(err);
                }}
              >
                {translate(
                  isMellomlagringActive ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.moveForward,
                )}
              </DigitalSubmissionButton>
            ) : (
              <DigitalSubmissionWithPrompt
                submission={submission}
                isValid={isValid}
                onError={(err) => {
                  setError(err);
                }}
              />
            ))}

          {isNoneSubmission(submissionTypes) && (
            <LinkButton
              buttonVariant="primary"
              onClick={(e) => !isValid(e)}
              to={{ pathname: `${formUrl}/ingen-innsending`, search }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.moveForward)}
              </span>
              <span className="navds-button__icon">
                <ArrowRightIcon aria-hidden />
              </span>
            </LinkButton>
          )}
          <EditAnswersButton form={form} formUrl={formUrl} panelValidationList={panelValidationList} />
        </div>
        {isMellomlagringActive && <SaveAndDeleteButtons submission={submission} />}
        {!isMellomlagringActive && (
          <div className="button-row button-row__center">
            <Button variant="tertiary" onClick={() => setIsCancelModalOpen(true)}>
              {translate(TEXTS.grensesnitt.navigation.cancelAndDiscard)}
            </Button>
          </div>
        )}
      </nav>
      <ConfirmationModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => {}}
        confirmType={'danger'}
        texts={TEXTS.grensesnitt.confirmDiscardPrompt}
        exitUrl={exitUrl}
      />
    </>
  );
};

export default SummaryPageNavigation;
