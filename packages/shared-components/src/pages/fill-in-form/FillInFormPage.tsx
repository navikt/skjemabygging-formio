import { navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/modal/confirmation/ConfirmationModal';
import NavForm from '../../components/nav-form/NavForm';
import { useAmplitude } from '../../context/amplitude/index';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages/index.js';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { LoadingComponent } from '../../index';
import { scrollToAndSetFocus } from '../../util/focus-management/focus-management';
import { getPanelSlug } from '../../util/form/form';
import urlUtils from '../../util/url/url';

type ModalType = 'save' | 'delete' | 'discard';

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const navigate = useNavigate();
  const {
    loggSkjemaApnet,
    loggSkjemaSporsmalBesvart,
    loggSkjemaSporsmalBesvartForSpesialTyper,
    loggSkjemaStegFullfort,
    loggSkjemaValideringFeilet,
    loggNavigering,
  } = useAmplitude();
  const { featureToggles, submissionMethod } = useAppConfig();
  const [formForRendering, setFormForRendering] = useState();
  const {
    startMellomlagring,
    updateMellomlagring,
    deleteMellomlagring,
    mellomlagringError,
    isMellomlagringEnabled,
    isMellomlagringReady,
    isMellomlagringActive,
  } = useSendInn();
  const { currentLanguage, translationsForNavForm, translate } = useLanguages();
  const { hash } = useLocation();
  const mutationObserverRef = useRef<MutationObserver | undefined>(undefined);
  const [showModal, setShowModal] = useState<ModalType>();

  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate
    ? submission?.fyllutState?.mellomlagring?.deletionDate
    : '';

  useEffect(() => {
    setFormForRendering(submissionMethod === 'digital' ? navFormUtils.removeVedleggspanel(form) : form);
  }, [form, submissionMethod]);

  useEffect(() => {
    loggSkjemaApnet(submissionMethod);
  }, [loggSkjemaApnet, submissionMethod]);

  useEffect(() => {
    if (isMellomlagringEnabled) {
      startMellomlagring(submission);
    }
  }, [submission, startMellomlagring, isMellomlagringEnabled]);

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

  if (featureToggles?.enableTranslations && !translationsForNavForm) {
    return null;
  }

  if (isMellomlagringEnabled && !isMellomlagringReady && !mellomlagringError) {
    return <LoadingComponent heightOffsetRem={18} />;
  }

  function updatePanelUrl(panelPath) {
    // We need to get location data from window, since this function runs inside formio
    navigate({ pathname: `${formUrl}/${panelPath}`, search: window.location.search });
  }

  function goToPanelFromUrlParam(formioInstance) {
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
  }

  function onNextPage({ page, currentPanels, submission }) {
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
  }

  function onPreviousPage({ page, currentPanels }) {
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.previous),
      destinasjon: `${formUrl}/${currentPanels?.[page - 2]}`,
    });
    onNextOrPreviousPage(page, currentPanels);
  }

  function onCancel({ submission }) {
    setSubmission(submission);
    setShowModal(isMellomlagringActive ? 'delete' : 'discard');
  }

  function onSave({ submission }) {
    setSubmission(submission);
    setShowModal('save');
  }

  function onNextOrPreviousPage(page, currentPanels) {
    if (page <= currentPanels.length - 1) {
      updatePanelUrl(currentPanels[page]);
    }
    scrollToAndSetFocus('#maincontent', 'start');
  }

  function onWizardPageSelected(panel) {
    loggNavigering({ lenkeTekst: translate(panel.component.title), destinasjon: `${formUrl}/${panel.path}` });
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    goToPanelFromUrlParam(formioInstance);
  }

  const getModalTexts = (modalType?: ModalType) => {
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
  };

  const onSubmit = (submission) => {
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
  };

  const onValidationError = () => {
    loggSkjemaValideringFeilet();
  };

  const onConfirmCancel = async () => {
    const logNavigation = (lenkeTekst) =>
      loggNavigering({
        lenkeTekst,
        destinasjon: exitUrl,
      });

    switch (showModal) {
      case 'save':
        logNavigation(translate(TEXTS.grensesnitt.navigation.saveDraft));
        await updateMellomlagring(submission);
        break;
      case 'delete':
        logNavigation(translate(TEXTS.grensesnitt.navigation.saveDraft));
        await deleteMellomlagring();
        break;
      case 'discard':
      default:
        logNavigation(translate(TEXTS.grensesnitt.navigation.cancel));
    }
  };

  if (!formForRendering) {
    return null;
  }

  return (
    <div>
      <NavForm
        form={formForRendering}
        language={featureToggles?.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles?.enableTranslations ? translationsForNavForm : undefined}
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
