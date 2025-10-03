import {
  ComponentError,
  NavFormType,
  navFormUtils,
  SubmissionData,
  SubmissionMetadata,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import EventEmitter from 'eventemitter3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { To, useLocation, useNavigate } from 'react-router';
import FormError from '../../components/form/FormError';
import FormSavedStatus from '../../components/form/FormSavedStatus';
import ConfirmationModal from '../../components/modal/confirmation/ConfirmationModal';
import NavForm, { FormNavigationPaths } from '../../components/nav-form/NavForm';
import FormNavigation from '../../components/nav-form/navigation/FormNavigation';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { KeyOrFocusComponentId } from '../../formio/overrides/wizard-overrides.js/focusOnComponent';
import { LoadingComponent } from '../../index';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import urlUtils from '../../util/url/url';
import FormErrorSummary from './FormErrorSummary';

type ModalType = 'save' | 'delete' | 'discard';
type FyllutEvent = 'focusOnComponent' | 'validateOnNextPage';

export const FillInFormPage = () => {
  const { form, submission, setSubmission } = useForm();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { submissionMethod, logger } = useAppConfig();
  const [formForRendering, setFormForRendering] = useState<NavFormType>();
  const { mellomlagringError, isMellomlagringAvailable, isMellomlagringReady } = useSendInn();
  const { currentLanguage, translationsForNavForm, translate } = useLanguages();
  const [showModal, setShowModal] = useState<ModalType>();
  const [formNavigationPaths, setFormNavigationPaths] = useState<FormNavigationPaths>({});
  const focusMainContentRef = useRef<boolean>(false);
  const [errors, setErrors] = useState<ComponentError[]>([]);
  const fyllutEvents = useMemo(() => new EventEmitter<FyllutEvent>(), []);
  const errorSummaryRef = useRef<HTMLElement | null>(null);
  const { hash } = useLocation();

  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const focusOnComponent = useCallback<(id: KeyOrFocusComponentId) => void>(
    (id: KeyOrFocusComponentId) => fyllutEvents.emit('focusOnComponent', id),
    [fyllutEvents],
  );

  const validateOnNextPage = useCallback<(validationResultCallback: (valid: boolean) => void) => void>(
    (validationResultCallback) => fyllutEvents.emit('validateOnNextPage', { validationResultCallback }),
    [fyllutEvents],
  );

  const navigateTo = useCallback<(to: To) => void>(
    (to: To) => {
      logger?.debug(`FillInFormPage: navigateTo`, { to });
      focusMainContentRef.current = true;
      navigate(to);
    },
    [logger, navigate],
  );

  useEffect(() => {
    if (focusMainContentRef.current) {
      logger?.debug(`FillInFormPage: current panel has changed, scrolling to and focus main content`);
      scrollToAndSetFocus('#maincontent', 'start');
      focusMainContentRef.current = false;
    }
  }, [formNavigationPaths.curr, logger]);

  const onCancel = useCallback(() => {
    setShowModal('discard');
  }, [setShowModal]);

  const onShowErrors = useCallback(
    (errorsFromForm: ComponentError[]) => {
      setErrors(errorsFromForm);
    },
    [setErrors],
  );

  const onErrorSummaryFocus = useCallback(() => {
    if (errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, []);

  const onSubmissionChanged = useCallback(
    (submissionData: SubmissionData) => {
      setSubmission((prevSubmission) => ({
        ...prevSubmission,
        data: {
          ...submissionData,
        },
      }));
    },
    [setSubmission],
  );

  const onSubmissionMetadataChanged = useCallback(
    (submissionMetadata: SubmissionMetadata) => {
      setSubmission((prevSubmission) => ({
        ...prevSubmission,
        data: {
          ...prevSubmission?.data,
        },
        metadata: {
          ...submissionMetadata,
        },
      }));
    },
    [setSubmission],
  );

  const onNavigationPathsChanged = useCallback<(paths: FormNavigationPaths) => void>(
    (paths: FormNavigationPaths) => setFormNavigationPaths(paths),
    [setFormNavigationPaths],
  );

  const onFocusOnComponentPageChanged = useCallback<(page: { key: string }) => void>(
    (page: { key: string }) => navigate({ pathname: `${form.path}/${page.key}`, search }),
    [form.path, navigate, search],
  );

  const isValid = useCallback(
    (): Promise<boolean> => new Promise((resolve) => validateOnNextPage(resolve)),
    [validateOnNextPage],
  );

  useEffect(() => {
    setFormForRendering(
      submissionMethod === 'digital' || submissionMethod === 'digitalnologin'
        ? navFormUtils.removeVedleggspanel(form)
        : form,
    );
  }, [form, submissionMethod]);

  if (!translationsForNavForm) {
    return null;
  }

  if (isMellomlagringAvailable && !isMellomlagringReady && !mellomlagringError) {
    return <LoadingComponent heightOffsetRem={18} />;
  }

  if (!formForRendering) {
    return null;
  }

  return (
    <div>
      <div>
        <FormErrorSummary
          // error refers to TEXTS.validering.error
          heading={translate('error')}
          errors={errors}
          focusOnComponent={focusOnComponent}
          ref={(ref) => (errorSummaryRef.current = ref)}
        />
        <NavForm
          form={formForRendering}
          language={currentLanguage}
          i18n={translationsForNavForm}
          submission={submission}
          fyllutEvents={fyllutEvents}
          className="nav-form"
          events={{
            onShowErrors,
            onErrorSummaryFocus,
            onSubmissionChanged,
            onSubmissionMetadataChanged,
            onNavigationPathsChanged,
            onFocusOnComponentPageChanged,
          }}
          hash={hash}
        />
        <FormSavedStatus submission={submission} />
        <FormError error={submission?.fyllutState?.mellomlagring?.error} />
        <FormNavigation
          submission={submission}
          isValid={isValid}
          paths={formNavigationPaths}
          onCancel={onCancel}
          navigateTo={navigateTo}
          finalStep={submissionMethod === 'digitalnologin' ? 'vedlegg' : 'oppsummering'}
        />
      </div>
      <ConfirmationModal
        open={!!showModal}
        onClose={() => setShowModal(undefined)}
        onConfirm={() => Promise.resolve()}
        confirmType="danger"
        texts={TEXTS.grensesnitt.confirmDiscardPrompt}
        exitUrl={exitUrl}
      />
    </div>
  );
};
