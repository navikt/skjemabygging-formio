import {
  ComponentError,
  NavFormType,
  navFormUtils,
  Submission,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import EventEmitter from 'eventemitter3';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormStepper from '../../components/form/form-stepper/FormStepper';
import FormError from '../../components/form/FormError';
import FormSavedStatus from '../../components/form/FormSavedStatus';
import ConfirmationModal from '../../components/modal/confirmation/ConfirmationModal';
import NavForm from '../../components/nav-form/NavForm';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { KeyOrFocusComponentId } from '../../formio/overrides/wizard-overrides.js/focusOnComponent';
import { LoadingComponent } from '../../index';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import urlUtils from '../../util/url/url';
import FormErrorSummary from './FormErrorSummary';

type ModalType = 'save' | 'delete' | 'discard';
type FyllutEvent = 'focusOnComponent';

interface FillInFormPageProps {
  form: NavFormType;
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  formUrl: string;
}

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }: FillInFormPageProps) => {
  const navigate = useNavigate();
  const { submissionMethod } = useAppConfig();
  const [formForRendering, setFormForRendering] = useState<NavFormType>();
  const {
    startMellomlagring,
    updateMellomlagring,
    deleteMellomlagring,
    mellomlagringError,
    isMellomlagringAvailable,
    isMellomlagringReady,
    isMellomlagringActive,
  } = useSendInn();
  const { currentLanguage, translationsForNavForm, translate } = useLanguages();
  const { hash } = useLocation();
  const mutationObserverRef = useRef<MutationObserver | undefined>(undefined);
  const [showModal, setShowModal] = useState<ModalType>();
  const [errors, setErrors] = useState<ComponentError[]>([]);
  const fyllutEvents = useMemo(() => new EventEmitter<FyllutEvent>(), []);
  const errorSummaryRef = useRef<HTMLElement | null>(null);

  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';

  const updatePanelUrl = useCallback(
    (panelPath: string) => {
      // We need to get location data from window, since this function runs inside formio
      navigate({ pathname: `${formUrl}/${panelPath}`, search: window.location.search });
    },
    [formUrl, navigate],
  );

  const focusOnComponent = useCallback<(id: KeyOrFocusComponentId) => void>(
    (id: KeyOrFocusComponentId) => {
      fyllutEvents.emit('focusOnComponent', id);
    },
    [fyllutEvents],
  );

  const onNextOrPreviousPage = useCallback(
    (page, currentPanels) => {
      if (page <= currentPanels.length - 1) {
        updatePanelUrl(currentPanels[page]);
      }
      scrollToAndSetFocus('#maincontent', 'start');
    },
    [updatePanelUrl],
  );

  const onNextPage = useCallback(
    ({ page, currentPanels, submission }) => {
      if (isMellomlagringActive) {
        updateMellomlagring(submission);
        setSubmission(submission);
      }
      onNextOrPreviousPage(page, currentPanels);
    },
    [isMellomlagringActive, updateMellomlagring, onNextOrPreviousPage, setSubmission],
  );

  const onPrevPage = useCallback(
    ({ page, currentPanels }) => {
      onNextOrPreviousPage(page, currentPanels);
    },
    [onNextOrPreviousPage],
  );

  const onCancel = useCallback(
    ({ submission }) => {
      setSubmission(submission);
      setShowModal(isMellomlagringActive ? 'delete' : 'discard');
    },
    [isMellomlagringActive, setSubmission, setShowModal],
  );

  const onSave = useCallback(
    ({ submission }) => {
      setSubmission(submission);
      setShowModal('save');
    },
    [setSubmission, setShowModal],
  );

  const onWizardPageSelected = useCallback(
    (panel) => {
      updatePanelUrl(panel.path);
    },
    [updatePanelUrl],
  );

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

  const getModalTexts = useCallback(
    (modalType?: ModalType) => {
      switch (modalType) {
        case 'save':
          return {
            ...TEXTS.grensesnitt.confirmSavePrompt,
            body: translate(TEXTS.grensesnitt.confirmSavePrompt.body, { date: deletionDate }),
          };
        case 'delete':
          return TEXTS.grensesnitt.confirmDeletePrompt;
        case 'discard':
        default:
          return TEXTS.grensesnitt.confirmDiscardPrompt;
      }
    },
    [deletionDate, translate],
  );

  const onSubmit = useCallback(
    (submission) => {
      if (isMellomlagringActive) {
        updateMellomlagring(submission);
      }

      // We need to get location data from window, since this function runs inside formio
      navigate({ pathname: `${formUrl}/oppsummering`, search: window.location.search });
    },
    [formUrl, isMellomlagringActive, navigate, updateMellomlagring],
  );

  const onComponentChange = useCallback(
    (args: any) => {
      if (args.flags.modified) {
        setSubmission((oldSubmission) => ({
          ...oldSubmission,
          data: {
            ...oldSubmission?.data,
            [args.component.key]: args.value,
          },
        }));
      }
    },
    [setSubmission],
  );

  const onConfirmCancel = useCallback(async () => {
    switch (showModal) {
      case 'save':
        await updateMellomlagring(submission as Submission);
        break;
      case 'delete':
        await deleteMellomlagring();
        break;
    }
  }, [deleteMellomlagring, showModal, submission, updateMellomlagring]);

  useEffect(() => {
    setFormForRendering(submissionMethod === 'digital' ? navFormUtils.removeVedleggspanel(form) : form);
  }, [form, submissionMethod]);

  useEffect(() => {
    if (isMellomlagringAvailable) {
      startMellomlagring(submission as Submission);
    }
  }, [submission, startMellomlagring, isMellomlagringAvailable]);

  // Clean up mutationObserver
  const removeMutationObserver = () => {
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = undefined;
    }
  };

  useEffect(() => {
    // Try to find the input corresponding to the anchor/fragment in the url (e.g. #nameInput)
    // Since the input fields are rendered by Formio, we need to monitor the DOM to know when the element is ready
    if (hash && !mutationObserverRef.current) {
      // Create a MutationObserver to monitor the DOM. The callback is executed whenever the DOM changes.
      mutationObserverRef.current = new MutationObserver(() => {
        const fragment = hash.substring(1);
        // Look for elements that may match the provided hash and pick the first that is an input element
        const hashElementList = document.querySelectorAll(`[id$=${fragment}],[name*=${fragment}]`);
        const hashInputElement = Array.from(hashElementList).find((element) => element.tagName === 'INPUT');
        if (hashInputElement) {
          removeMutationObserver();
          scrollToAndSetFocus(`[id=${hashInputElement.id}]`);
        }
      });
      // Start monitoring the DOM
      mutationObserverRef.current.observe(document, { subtree: true, childList: true });
    }
  }, [hash]);

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
    <div className="fyllut-layout">
      <div>
        <FormErrorSummary
          heading={translate(TEXTS.validering.error)}
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
            onSubmit,
            onNextPage,
            onPrevPage,
            onCancel,
            onSave,
            onWizardPageSelected,
            onShowErrors,
            onErrorSummaryFocus,
            onComponentChange,
          }}
        />
        <FormSavedStatus submission={submission} />
        <FormError error={submission?.fyllutState?.mellomlagring?.error} />
      </div>
      <div>
        <FormStepper
          form={formForRendering}
          formUrl={formUrl}
          completed={true}
          setSubmission={setSubmission}
          submission={submission}
        />
      </div>
      <ConfirmationModal
        open={!!showModal}
        onClose={() => setShowModal(undefined)}
        onConfirm={onConfirmCancel}
        confirmType={showModal === 'save' ? 'primary' : 'danger'}
        texts={getModalTexts(showModal)}
        exitUrl={exitUrl}
      />
    </div>
  );
};
