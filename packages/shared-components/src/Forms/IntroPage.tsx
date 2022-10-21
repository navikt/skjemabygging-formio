import { GuidePanel, Radio, RadioGroup } from "@navikt/ds-react";
import { NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { AlertStripeFeil } from "nav-frontend-alertstriper";
import { Hovedknapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import http from "../api/http";
import { useLanguages } from "../context/languages";
import { useAppConfig } from "../index";
import { getPanelSlug } from "../util/form";
import { removeBeforeUnload } from "../util/unload";
import { FormTitle } from "./components/FormTitle";

export interface Props {
  form: NavFormType;
  formUrl: string;
}

const supportsPapirOgDigital = (form: NavFormType) => {
  const { innsending } = form.properties;
  return !innsending || innsending === "PAPIR_OG_DIGITAL";
};

export function IntroPage({ form, formUrl }: Props) {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const history = useHistory();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const { submissionMethod } = useAppConfig();
  const [paramSub, setParamSub] = useState<string | undefined>(submissionMethod);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const firstPanelSlug = getPanelSlug(form, 0);
  const [submissionMethodMissing, setSubmissionMethodMissing] = useState<boolean>(
    !submissionMethod && supportsPapirOgDigital(form)
  );

  useEffect(() => {
    if (submissionMethod) {
      if (submissionMethod === http.SubmissionMethodType.PAPER) {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
      }
      // No description when submissionMethodType === http.SubmissionMethodType.DIGITAL
    } else {
      if (form.properties?.innsending === "KUN_PAPIR") {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
      } else if (form.properties?.innsending === "PAPIR_OG_DIGITAL") {
        setDescriptionBold(TEXTS.statiske.introPage.paperAndDigitalDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperAndDigitalDescription);
      } else if (form.properties?.innsending === "INGEN") {
        setDescriptionBold(TEXTS.statiske.introPage.noSubmissionDescriptionBold);
        setDescription(TEXTS.statiske.introPage.noSubmissionDescription);
      }
      // No description when form.properties.innsending === "KUN_DIGITAL"
    }
  }, [search]);

  useEffect(() => {
    setSubmissionMethodMissing(!submissionMethod && supportsPapirOgDigital(form));
  }, [submissionMethod, form]);

  const onClickStart = () => {
    if (paramSub) {
      removeBeforeUnload();
      const { pathname, search } = window.location;
      const params = new URLSearchParams(search);
      params.set("sub", paramSub);
      window.location.href = `${pathname}/${firstPanelSlug}?${params.toString()}`;
    } else {
      setErrorMessage(translate(TEXTS.statiske.introPage.submissionMethod.required));
    }
  };

  return (
    <main>
      <FormTitle form={form} className="margin-bottom-double" />

      <GuidePanel className="margin-bottom-double">
        <Undertittel className="margin-bottom-default">{translate(TEXTS.statiske.introPage.title)}</Undertittel>
        <ul>
          {description && (
            <li className="margin-bottom-default">
              <b>{translate(descriptionBold)} </b>
              {translate(description)}
            </li>
          )}
          <li className="margin-bottom-default">
            <b>{translate(TEXTS.statiske.introPage.requiredFieldsBold)} </b>
            {translate(TEXTS.statiske.introPage.requiredFields)}
          </li>
          <li className="margin-bottom-default">
            <b>{translate(TEXTS.statiske.introPage.notSaveBold)} </b>
            {translate(TEXTS.statiske.introPage.notSave)}
          </li>
          <li className="margin-bottom-default">
            <b>{translate(TEXTS.statiske.introPage.publicComputerBold)} </b>
            {translate(TEXTS.statiske.introPage.publicComputer)}
          </li>
        </ul>
      </GuidePanel>

      <nav>
        <div className="list-inline">
          <div className="list-inline-item">
            {submissionMethodMissing && (
              <>
                <RadioGroup
                  legend={translate(TEXTS.statiske.introPage.submissionMethod.legend)}
                  required={true}
                  onChange={(sub: string) => {
                    setErrorMessage(undefined);
                    setParamSub(sub);
                  }}
                  className="margin-bottom-default"
                >
                  <Radio value="paper">{translate(TEXTS.statiske.introPage.submissionMethod.paper)}</Radio>
                  <Radio value="digital">{translate(TEXTS.statiske.introPage.submissionMethod.digital)}</Radio>
                </RadioGroup>
                {errorMessage && <AlertStripeFeil className="margin-bottom-default">{errorMessage}</AlertStripeFeil>}
                <button onClick={onClickStart} className="knapp knapp--hoved btn-wizard-nav-next">
                  {translate(TEXTS.grensesnitt.introPage.start)}
                </button>
              </>
            )}
            {!submissionMethodMissing && (
              <Link to={{ pathname: `${formUrl}/${firstPanelSlug}`, search }}>
                <Hovedknapp className="btn-wizard-nav-next">{translate(TEXTS.grensesnitt.introPage.start)}</Hovedknapp>
              </Link>
            )}
          </div>
        </div>
        <div className="list-inline">
          <div className="list-inline-item">
            <button onClick={() => history.goBack()} className="btn-wizard-nav-cancel">
              {translate(TEXTS.grensesnitt.goBack)}
            </button>
          </div>
        </div>
      </nav>
    </main>
  );
}
