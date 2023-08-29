import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useRef } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { useSendInn } from "../context/sendInn/sendInnContext";
import { LoadingComponent } from "../index";
import { scrollToAndSetFocus } from "../util/focus-management.js";
import { getPanelSlug } from "../util/form";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const {
    loggSkjemaApnet,
    loggSkjemaSporsmalBesvart,
    loggSkjemaSporsmalBesvartForSpesialTyper,
    loggSkjemaStegFullfort,
    loggSkjemaValideringFeilet,
    loggNavigering,
  } = useAmplitude();
  const { featureToggles, submissionMethod } = useAppConfig();
  const { startMellomlagring, updateMellomlagring, isMellomlagringEnabled, isMellomlagringReady } = useSendInn();
  const { currentLanguage, translationsForNavForm, translate } = useLanguages();
  const { panelSlug } = useParams();
  const { hash } = useLocation();
  const mutationObserverRef = useRef(undefined);

  useEffect(() => {
    loggSkjemaApnet(submissionMethod);
  }, [loggSkjemaApnet, submissionMethod]);

  useEffect(() => {
    if (isMellomlagringEnabled) {
      startMellomlagring(submission);
    }
  }, [submission, startMellomlagring, isMellomlagringEnabled]);

  const removeMutationObserver = () => {
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }
  };

  useEffect(() => {
    if (hash && !mutationObserverRef.current) {
      mutationObserverRef.current = new MutationObserver(() => {
        const hashElementList = document.querySelectorAll(`[id$=${hash.substring(1)}]`);
        const hashInputElement = Array.from(hashElementList).find((element) => element.tagName === "INPUT");
        if (hashInputElement) {
          removeMutationObserver();
          scrollToAndSetFocus(`[id=${hashInputElement.id}]`);
        }
      });
      mutationObserverRef.current.observe(document, { subtree: true, childList: true });
    }
  }, [hash]);

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  if (isMellomlagringEnabled && !isMellomlagringReady) {
    return <LoadingComponent heightOffsetRem={18} />;
  }

  function updatePanelUrl(panelPath) {
    history.push({ pathname: `${formUrl}/${panelPath}`, search: window.location.search });
  }

  function goToPanelFromUrlParam(formioInstance) {
    if (!panelSlug) {
      const pathOfPanel = getPanelSlug(form, 0);
      updatePanelUrl(pathOfPanel);
    } else {
      if (typeof formioInstance?.setPage === "function") {
        const panelIndex = formioInstance.currentPanels.indexOf(panelSlug);
        if (panelIndex >= 0) {
          formioInstance.setPage(panelIndex);
        } else {
          formioInstance.setPage(0);
        }
      }
    }
  }

  function onNextPage({ page, currentPanels, submission }) {
    updateMellomlagring(submission);
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.next),
      destinasjon: `${formUrl}/${currentPanels?.[page]}`,
    });
    loggSkjemaStegFullfort({ steg: page, skjemastegNokkel: currentPanels?.[page - 1] || "" });
    onNextOrPreviousPage(page, currentPanels);
  }

  function onPreviousPage({ page, currentPanels }) {
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.previous),
      destinasjon: `${formUrl}/${currentPanels?.[page - 2]}`,
    });
    onNextOrPreviousPage(page, currentPanels);
  }

  function onCancel({ url }) {
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancel),
      destinasjon: url,
    });
  }

  function onNextOrPreviousPage(page, currentPanels) {
    if (page <= currentPanels.length - 1) {
      updatePanelUrl(currentPanels[page]);
    }
    scrollToAndSetFocus("#maincontent", "start");
  }

  function onWizardPageSelected(panel) {
    loggNavigering({ lenkeTekst: translate(panel.component.title), destinasjon: `${formUrl}/${panel.path}` });
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    goToPanelFromUrlParam(formioInstance);
  }

  const onSubmit = (submission) => {
    updateMellomlagring(submission);
    setSubmission(submission);
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.submit),
      destinasjon: `${formUrl}/oppsummering`,
    });
    const skjemastegNokkel = window.location.pathname.split(`${formUrl}/`)[1];
    loggSkjemaStegFullfort({
      steg: form.components.findIndex((panel) => panel.key === skjemastegNokkel) + 1,
      skjemastegNokkel,
    });
    history.push({ pathname: `${formUrl}/oppsummering`, search: window.location.search });
  };

  const onError = () => {
    loggSkjemaValideringFeilet();
    // Commenting out as temporary fix for issue where we scroll to errorsList when onChange is triggered
    //scrollToAndSetFocus("div[id^='error-list-'] li:first-of-type");
  };

  return (
    <div>
      <NavForm
        form={form}
        language={featureToggles.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles.enableTranslations ? translationsForNavForm : undefined}
        submission={submission}
        onBlur={loggSkjemaSporsmalBesvart}
        onChange={loggSkjemaSporsmalBesvartForSpesialTyper}
        onError={onError}
        onSubmit={onSubmit}
        onNextPage={onNextPage}
        onPrevPage={onPreviousPage}
        onCancel={onCancel}
        formReady={onFormReady}
        submissionReady={goToPanelFromUrlParam}
        onWizardPageSelected={onWizardPageSelected}
        className="nav-form"
      />
    </div>
  );
};
