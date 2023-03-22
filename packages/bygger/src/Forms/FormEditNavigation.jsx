import { Button } from "@navikt/ds-react";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { Link, useHistory } from "react-router-dom";

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
            Innstillinger
          </Link>
        </li>
      )}
      <li className="list-inline-item">
        <Button onClick={() => onSave(form)}>Lagre</Button>
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
