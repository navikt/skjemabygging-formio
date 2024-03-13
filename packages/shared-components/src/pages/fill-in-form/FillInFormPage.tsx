import {
  ComponentError,
  FyllutState,
  NavFormType,
  navFormUtils,
  Submission,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import EventEmitter from 'eventemitter3';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../../components/modal/confirmation/ConfirmationModal';
import NavForm from '../../components/nav-form/NavForm';
import { useAmplitude } from '../../context/amplitude';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { KeyOrFocusComponentId } from '../../formio/overrides/wizard-overrides.js/focusOnComponent';
import { LoadingComponent } from '../../index';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import { getPanelSlug } from '../../util/form/form';
import urlUtils from '../../util/url/url';
import FormErrorSummary from './FormErrorSummary';

type ModalType = 'save' | 'delete' | 'discard';

interface FillInFormPageProps {
  form: NavFormType;
  submission?: Submission | { fyllutState: FyllutState };
  setSubmission: Dispatch<SetStateAction<Submission | { fyllutState: FyllutState } | undefined>>;
  formUrl: string;
}

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }: FillInFormPageProps) => {
  const navigate = useNavigate();
  const {
    loggSkjemaApnet,
    loggSkjemaSporsmalBesvart,
    loggSkjemaSporsmalBesvartForSpesialTyper,
    loggSkjemaStegFullfort,
    loggSkjemaValideringFeilet,
    loggNavigering,
  } = useAmplitude();
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
  const { panelSlug } = useParams();
  const mutationObserverRef = useRef<MutationObserver | undefined>(undefined);
  const formioInstanceRef = useRef<any>();
  const [showModal, setShowModal] = useState<ModalType>();
  const [errors, setErrors] = useState<ComponentError[]>([]);
  const fyllutEvents = useMemo(() => new EventEmitter(), []);
  const errorSummaryRef = useRef<HTMLElement | null>(null);

  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';

  const updatePanelUrl = useCallback(
    (panelPath) => {
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

  const goToPanelFromUrlParam = useCallback(
    (formioInstance) => {
      // We need to get location data from window, since this function runs inside formio
      // www.nav.no/fyllut/:form/:panel
      const panelFromUrl = window.location.pathname.split('/')[3];
      if (!panelFromUrl) {
        const pathOfPanel = getPanelSlug(form, 0);
        updatePanelUrl(pathOfPanel);
      } else {
        if (typeof formioInstance?.setPage === 'function') {
          const panelIndex = formioInstance.currentPanels.indexOf(panelFromUrl);
          if (panelIndex >= 0) {
            formioInstance.setPage(panelIndex);
          } else {
            formioInstance.setPage(0);
          }
        }
      }
    },
    [form, updatePanelUrl],
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
      loggNavigering({
        lenkeTekst: translate(TEXTS.grensesnitt.navigation.next),
        destinasjon: `${formUrl}/${currentPanels?.[page]}`,
      });
      loggSkjemaStegFullfort({ steg: page, skjemastegNokkel: currentPanels?.[page - 1] || '' });
      onNextOrPreviousPage(page, currentPanels);
    },
    [
      formUrl,
      isMellomlagringActive,
      updateMellomlagring,
      loggNavigering,
      loggSkjemaStegFullfort,
      onNextOrPreviousPage,
      setSubmission,
      translate,
    ],
  );

  const onPreviousPage = useCallback(
    ({ page, currentPanels }) => {
      loggNavigering({
        lenkeTekst: translate(TEXTS.grensesnitt.navigation.previous),
        destinasjon: `${formUrl}/${currentPanels?.[page - 2]}`,
      });
      onNextOrPreviousPage(page, currentPanels);
    },
    [formUrl, loggNavigering, onNextOrPreviousPage, translate],
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
      loggNavigering({ lenkeTekst: translate(panel.component.title), destinasjon: `${formUrl}/${panel.path}` });
      updatePanelUrl(panel.path);
    },
    [formUrl, loggNavigering, updatePanelUrl, translate],
  );

  const onFormReady = useCallback(
    (formioInstance) => {
      formioInstanceRef.current = formioInstance;
      goToPanelFromUrlParam(formioInstance);
    },
    [goToPanelFromUrlParam],
  );

  function onShowErrors(errorsFromForm) {
    setErrors(errorsFromForm);
  }

  function onErrorSummaryFocus() {
    if (errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }

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
      setSubmission(submission);
      loggNavigering({
        lenkeTekst: translate(TEXTS.grensesnitt.navigation.submit),
        destinasjon: `${formUrl}/oppsummering`,
      });
      // We need to get location data from window, since this function runs inside formio
      const skjemastegNokkel = window.location.pathname.split(`${formUrl}/`)[1];
      loggSkjemaStegFullfort({
        steg: form.components.findIndex((panel) => panel.key === skjemastegNokkel) + 1,
        skjemastegNokkel,
      });
      // We need to get location data from window, since this function runs inside formio
      navigate({ pathname: `${formUrl}/oppsummering`, search: window.location.search });
    },
    [
      form.components,
      formUrl,
      isMellomlagringActive,
      loggNavigering,
      loggSkjemaStegFullfort,
      navigate,
      setSubmission,
      translate,
      updateMellomlagring,
    ],
  );

  const onValidationError = useCallback(() => {
    loggSkjemaValideringFeilet();
  }, [loggSkjemaValideringFeilet]);

  const onConfirmCancel = useCallback(async () => {
    const logNavigation = (lenkeTekst) =>
      loggNavigering({
        lenkeTekst,
        destinasjon: exitUrl,
      });

    switch (showModal) {
      case 'save':
        logNavigation(translate(TEXTS.grensesnitt.navigation.saveDraft));
        await updateMellomlagring(submission as Submission);
        break;
      case 'delete':
        logNavigation(translate(TEXTS.grensesnitt.navigation.saveDraft));
        await deleteMellomlagring();
        break;
      case 'discard':
      default:
        logNavigation(translate(TEXTS.grensesnitt.navigation.cancel));
    }
  }, [deleteMellomlagring, exitUrl, loggNavigering, showModal, submission, translate, updateMellomlagring]);

  useEffect(() => {
    setFormForRendering(submissionMethod === 'digital' ? navFormUtils.removeVedleggspanel(form) : form);
  }, [form, submissionMethod]);

  useEffect(() => {
    loggSkjemaApnet(submissionMethod);
  }, [loggSkjemaApnet, submissionMethod]);

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

  useEffect(() => {
    const instance = formioInstanceRef.current;
    if (instance && instance.currentPanel?.key !== panelSlug) {
      goToPanelFromUrlParam(instance);
    }
  }, [panelSlug, goToPanelFromUrlParam]);

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
        onBlur={loggSkjemaSporsmalBesvart}
        onChange={loggSkjemaSporsmalBesvartForSpesialTyper}
        onError={onValidationError}
        onSubmit={onSubmit}
        onNextPage={onNextPage}
        onPrevPage={onPreviousPage}
        onCancel={onCancel}
        onSave={onSave}
        formReady={onFormReady}
        submissionReady={goToPanelFromUrlParam}
        onWizardPageSelected={onWizardPageSelected}
        onShowErrors={onShowErrors}
        onErrorSummaryFocus={onErrorSummaryFocus}
        fyllutEvents={fyllutEvents}
        className="nav-form"
      />
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
