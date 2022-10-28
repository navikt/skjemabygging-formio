import { Button, GuidePanel } from "@navikt/ds-react";
import { NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import http from "../api/http";
import { useLanguages } from "../context/languages";
import { useAppConfig } from "../index";
import { getPanelSlug } from "../util/form";

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
  const firstPanelSlug = getPanelSlug(form, 0);

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

  return (
    <main className="fyllut-layout">
      <div>
        <GuidePanel poster className="margin-bottom-double">
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

        <nav className="form-nav">
          <Link to={{ pathname: `${formUrl}/${firstPanelSlug}`, search }}>
            <Button className="navds-button navds-button--primary">
              <span aria-live="polite" className="navds-label">
                {translate(TEXTS.grensesnitt.introPage.start)}
              </span>
            </Button>
          </Link>
          <button onClick={() => history.goBack()} className="navds-button navds-button--tertiary">
            <span aria-live="polite" className="navds-label">
              {translate(TEXTS.grensesnitt.goBack)}
            </span>
          </button>
        </nav>
      </div>
    </main>
  );
}
