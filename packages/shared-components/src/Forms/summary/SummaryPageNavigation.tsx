import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { InnsendingType, NavFormType, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppConfig } from '../../configContext';
import { useAmplitude } from '../../context/amplitude';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { getPanels } from '../../util/form';
import makeStyles from '../../util/jss';
import { PanelValidation } from '../../util/panelValidation';
import urlUtils from '../../util/url';
import DigitalSubmissionButton from '../components/DigitalSubmissionButton';
import DigitalSubmissionWithPrompt from '../components/DigitalSubmissionWithPrompt';
import { hasRelevantAttachments } from '../components/attachmentsUtil';
import ConfirmationModal from '../components/navigation/ConfirmationModal';
import EditAnswersButton from '../components/navigation/EditAnswersButton';
import SaveAndDeleteButtons from '../components/navigation/SaveAndDeleteButtons';

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
  const { loggSkjemaStegFullfort, loggSkjemaFullfort, loggSkjemaInnsendingFeilet, loggNavigering } = useAmplitude();
  const { translate } = useLanguages();
  const { mellomlagringError, isMellomlagringActive } = useSendInn();
  const [error, setError] = useState<Error>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const innsending: InnsendingType = form.properties.innsending || 'PAPIR_OG_DIGITAL';
  const styles = useStyles();
  const hasAttachments = hasRelevantAttachments(form, submission?.data ?? {});
  const canSubmit = (panelValidationList ?? []).every((panelValidation) => !panelValidation.hasValidationErrors);

  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const onClickPapirOrIngenInnsending = (e, path) => {
    if (!isValid(e)) {
      return;
    }
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.moveForward),
      destinasjon: `${formUrl}/${path}`,
    });
    loggSkjemaStegFullfort({
      steg: getPanels(form.components).length + 1,
      skjemastegNokkel: 'oppsummering',
    });
  };

  return (
    <>
      {mellomlagringError && (
        <Alert variant="error" className="mb">
          <Heading size="small" level="4">
            {translate(mellomlagringError.title)}
          </Heading>
          {translate(mellomlagringError.message)}
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
          {(submissionMethod === 'paper' ||
            innsending === 'KUN_PAPIR' ||
            (app === 'bygger' && innsending === 'PAPIR_OG_DIGITAL')) && (
            <Link
              className="navds-button navds-button--primary"
              onClick={(e) => onClickPapirOrIngenInnsending(e, 'send-i-posten')}
              to={{ pathname: `${formUrl}/send-i-posten`, search }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.moveForward)}
              </span>
              <span className="navds-button__icon">
                <ArrowRightIcon aria-hidden />
              </span>
            </Link>
          )}
          {canSubmit &&
            (submissionMethod === 'digital' || innsending === 'KUN_DIGITAL') &&
            (hasAttachments ? (
              <DigitalSubmissionButton
                withIcon
                submission={submission}
                isValid={isValid}
                onError={(err) => {
                  setError(err);
                  loggSkjemaInnsendingFeilet();
                }}
                onSuccess={() => loggSkjemaFullfort()}
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
                  loggSkjemaInnsendingFeilet();
                }}
                onSuccess={() => loggSkjemaFullfort()}
              />
            ))}

          {innsending === 'INGEN' && (
            <Link
              className="navds-button navds-button--primary"
              onClick={(e) => onClickPapirOrIngenInnsending(e, 'ingen-innsending')}
              to={{ pathname: `${formUrl}/ingen-innsending`, search }}
            >
              <span aria-live="polite" className="navds-body-short font-bold">
                {translate(TEXTS.grensesnitt.moveForward)}
              </span>
              <span className="navds-button__icon">
                <ArrowRightIcon aria-hidden />
              </span>
            </Link>
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
        onConfirm={() => {
          loggNavigering({
            lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
            destinasjon: exitUrl,
          });
        }}
        confirmType={'danger'}
        texts={TEXTS.grensesnitt.confirmDiscardPrompt}
        exitUrl={exitUrl}
      />
    </>
  );
};

export default SummaryPageNavigation;
