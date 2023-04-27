import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management.js";
import { getPanelSlug } from "../util/form";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const {
    loggSkjemaApnet,
    loggSkjemaSporsmalBesvart,
    loggSkjemaSporsmalForSpesialTyper,
    loggSkjemaStegFullfort,
    loggSkjemaValideringFeilet,
  } = useAmplitude();
  const { featureToggles, submissionMethod } = useAppConfig();
  const { currentLanguage, translationsForNavForm } = useLanguages();
  const { panelSlug } = useParams();

  useEffect(() => {
    loggSkjemaApnet(submissionMethod);
  }, [loggSkjemaApnet, submissionMethod]);

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
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

  function onNextPage({ page, currentPanels }) {
    loggSkjemaStegFullfort(page);
    onNextOrPreviousPage(page, currentPanels);
  }

  function onPreviousPage({ page, currentPanels }) {
    onNextOrPreviousPage(page, currentPanels);
  }

  function onNextOrPreviousPage(page, currentPanels) {
    if (page <= currentPanels.length - 1) {
      updatePanelUrl(currentPanels[page]);
    }
    scrollToAndSetFocus("#maincontent", "start");
  }

  function onWizardPageSelected(panel) {
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    goToPanelFromUrlParam(formioInstance);
  }

  const onSubmit = (submission) => {
    setSubmission(submission);
    const panelKey = window.location.pathname.split(`${formUrl}/`)[1];
    loggSkjemaStegFullfort(form.components.findIndex((panel) => panel.key === panelKey) + 1);
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
        onChange={loggSkjemaSporsmalForSpesialTyper}
        onError={onError}
        onSubmit={onSubmit}
        onNextPage={onNextPage}
        onPrevPage={onPreviousPage}
        formReady={onFormReady}
        submissionReady={goToPanelFromUrlParam}
        onWizardPageSelected={onWizardPageSelected}
        className="nav-form"
      />
    </div>
  );
};
