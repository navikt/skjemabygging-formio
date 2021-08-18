import { Link, useHistory } from "react-router-dom";
import { Hovedknapp } from "nav-frontend-knapper";
import React from "react";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";

export const FormEditNavigation = ({ editFormUrl, testFormUrl, formSettingsUrl, form, onSave }) => {
  const { featureToggles } = useAppConfig();
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const currentLanguage = params.get("lang");
  return (
    <ul className="list-inline">
      {editFormUrl && (
        <li className="list-inline-item">
          <Link className="knapp" to={editFormUrl}>
            Rediger
          </Link>
        </li>
      )}
      {testFormUrl && (
        <li className="list-inline-item">
          <Link className="knapp" to={testFormUrl}>
            Test
          </Link>
        </li>
      )}
      {formSettingsUrl && (
        <li className="list-inline-item">
          <Link className="knapp" to={formSettingsUrl}>
            Instillinger
          </Link>
        </li>
      )}
      <li className="list-inline-item">
        <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
      </li>
      {featureToggles.enableTranslations && (
        <li className="list-inline-item">
          <Link className="knapp" to={`/translations/${form.path}${currentLanguage ? `/${currentLanguage}` : ""}`}>
            Oversettelse
          </Link>
        </li>
      )}
    </ul>
  );
};
