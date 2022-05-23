import React from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { FormTitle } from "./components/FormTitle";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { featureToggles } = useAppConfig();
  const { currentLanguage, translationsForNavForm } = useLanguages();
  const { search } = useLocation();
  const { panelSlug } = useParams();

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  function getPanelSlug(pageIndex) {
    const panels = form?.components.filter((component) => component.type === "panel") || [];
    const panelAtPageIndex = panels[pageIndex];
    return panelAtPageIndex?.key;
  }

  function updatePanelUrl(panelPath) {
    const newPath = `${formUrl}/skjema/${panelPath}${search ? `?${search}` : ""}`;
    history.push(newPath);
  }

  function onNextOrPreviousPage({ page }) {
    const pathOfPanel = getPanelSlug(page);
    if (pathOfPanel) {
      updatePanelUrl(pathOfPanel);
    }
  }

  function onWizardPageSelected(panel) {
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    if (!panelSlug) {
      const pathOfPanel = getPanelSlug(0);
      updatePanelUrl(pathOfPanel);
    } else {
      if (formioInstance && typeof formioInstance?.setPage === "function") {
        const panelIndex = formioInstance.currentPanels.indexOf(panelSlug);
        if (panelIndex >= 0) {
          formioInstance.setPage(panelIndex);
        } else {
          formioInstance.setPage(0);
        }
      }
    }
  }

  return (
    <div>
      <FormTitle form={form} />
      <NavForm
        form={form}
        language={featureToggles.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles.enableTranslations ? translationsForNavForm : undefined}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onChange={(event) => loggSkjemaSporsmalForSpesialTyper(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          const urlSearchParams = new URLSearchParams(window.location.search).toString();
          history.push(`${formUrl}/oppsummering?${urlSearchParams}`);
        }}
        onNextPage={onNextOrPreviousPage}
        onPrevPage={onNextOrPreviousPage}
        formReady={onFormReady}
        onWizardPageSelected={onWizardPageSelected}
      />
    </div>
  );
};
