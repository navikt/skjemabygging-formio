import { GuidePanel } from "@navikt/ds-react";
import { NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Hovedknapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import http from "../api/http";
import { useLanguages } from "../context/languages";
import { useAppConfig } from "../index";
import { FormTitle } from "./components/FormTitle";

export interface Props {
  form: NavFormType;
  formUrl: string;
}

export function IntroPage({ form, formUrl }: Props) {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const history = useHistory();
  const [description, setDescription] = useState<string>();
  const [descriptionBold, setDescriptionBold] = useState<string>();
  const { submissionMethod } = useAppConfig();

  useEffect(() => {
    if (submissionMethod) {
      if (submissionMethod === http.SubmissionMethodType.PAPER) {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
      }
      // No description when submissionMethodType === http.SubmissionMethodType.DIGITAL
    } else {
      if (form.properties?.innsending === "KUN_PAPIR" || form.properties?.innsending === "INGEN") {
        setDescriptionBold(TEXTS.statiske.introPage.paperDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperDescription);
      } else if (form.properties?.innsending === "PAPIR_OG_DIGITAL") {
        setDescriptionBold(TEXTS.statiske.introPage.paperAndDigitalDescriptionBold);
        setDescription(TEXTS.statiske.introPage.paperAndDigitalDescription);
      }
      // No description when form.properties.innsending === "KUN_DIGITAL"
    }
  }, [search]);

  return (
    <>
      <FormTitle form={form} className="margin-bottom-double" />

      <GuidePanel className="margin-bottom-double">
        <Undertittel className="margin-bottom-default">{translate(TEXTS.statiske.introPage.title)}</Undertittel>
        <ul>
          {description && (
            <li className="margin-bottom-default">
              <b>{descriptionBold} </b>
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
            <Link to={{ pathname: `${formUrl}/skjema`, search }}>
              <Hovedknapp className="btn-wizard-nav-next">{translate(TEXTS.grensesnitt.introPage.start)}</Hovedknapp>
            </Link>
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
    </>
  );
}
