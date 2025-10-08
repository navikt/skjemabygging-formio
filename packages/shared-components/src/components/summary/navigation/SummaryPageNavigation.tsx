import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Alert, Button } from '@navikt/ds-react';
import { NavFormType, Submission, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { useAppConfig } from '../../../context/config/configContext';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { hasRelevantAttachments } from '../../../util/attachment/attachmentsUtil';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import urlUtils from '../../../util/url/url';
import DigitalSubmissionButton from '../../button/navigation/digital-submission/DigitalSubmissionButton';
import EditAnswersButton from '../../button/navigation/edit-answers/EditAnswersButton';
import SaveAndDeleteButtons from '../../button/navigation/save-and-delete/SaveAndDeleteButtons';
import FormError from '../../form/FormError';
import FormSavedStatus from '../../form/FormSavedStatus';
import LinkButton from '../../link-button/LinkButton';
import ConfirmationModal from '../../modal/confirmation/ConfirmationModal';
import DigitalSubmissionWithPrompt from '../../submission/DigitalSubmissionWithPrompt';

export interface Props {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
}

const SummaryPageNavigation = ({ form, submission, panelValidationList, isValid }: Props) => {
  const { submissionMethod, app } = useAppConfig();
  const { search } = useLocation();
  const { translate } = useLanguages();
  const { mellomlagringError, isMellomlagringActive } = useSendInn();
  const [error, setError] = useState<Error>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const submissionTypes = form.properties.submissionTypes;
  const hasAttachments = hasRelevantAttachments(form, submission ?? { data: {} });
  const canSubmit =
    !!panelValidationList && panelValidationList.every((panelValidation) => !panelValidation.hasValidationErrors);
  const sendIPosten =
    (submissionTypesUtils.isPaperSubmission(submissionTypes) && (submissionMethod === 'paper' || app === 'bygger')) ||
    submissionTypesUtils.isPaperSubmissionOnly(submissionTypes);

  const exitUrl = urlUtils.getExitUrl(window.location.href);

  return (
    <>
      <FormError error={mellomlagringError} />

      {error && (
        <Alert variant="error" className="mb" data-testid="error-message">
          {error.message}
        </Alert>
      )}

      <FormSavedStatus submission={submission} />

      <nav>
        <div className="button-row">
          {canSubmit && sendIPosten && (
            <LinkButton
              buttonVariant="primary"
              onClick={(e) => !isValid(e)}
              to={{ pathname: `/${form.path}/send-i-posten`, search }}
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
            (submissionMethod === 'digital' || submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) &&
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

          {canSubmit && submissionMethod === 'digitalnologin' && (
            <DigitalSubmissionButton
              withIcon
              submission={submission}
              isValid={isValid}
              onError={(err) => {
                setError(err);
              }}
            >
              {translate(TEXTS.grensesnitt.submitToNavPrompt.open)}
            </DigitalSubmissionButton>
          )}

          {submissionTypesUtils.isNoneSubmission(submissionTypes) && (
            <LinkButton
              buttonVariant="primary"
              onClick={(e) => !isValid(e)}
              to={{ pathname: `/${form.path}/ingen-innsending`, search }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.moveForward)}
              </span>
              <span className="navds-button__icon">
                <ArrowRightIcon aria-hidden />
              </span>
            </LinkButton>
          )}
          <EditAnswersButton form={form} panelValidationList={panelValidationList} />
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
