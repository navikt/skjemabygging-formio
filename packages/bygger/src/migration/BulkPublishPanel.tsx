import Formiojs from "formiojs/Formio";
import { Knapp } from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import { Undertekst, Undertittel } from "nav-frontend-typografi";
import React from "react";
import { bulkPublish } from "./api";

const BulkPublishPanel = ({ forms }) => {
  const onBulkPublish = async (formPaths) => {
    const bulkPublishResult = await bulkPublish(Formiojs.getToken(), { formPaths });
    console.log("bulkPublishResult", bulkPublishResult);
  };

  return (
    <>
      {forms.length > 0 && (
        <Panel className="margin-bottom-double">
          <Undertittel tag="h3">Disse skjemaene ble migrert, og må publiseres manuelt</Undertittel>
          <Undertekst>
            Pass på å kopiere denne listen før du laster siden på nytt eller utfører en ny migrering
          </Undertekst>
          <Knapp onClick={() => onBulkPublish(forms.map((form) => form.path))}>Publiser nå</Knapp>
          <ul>
            {forms.map((form) => (
              <li
                key={form.properties.skjemanummer}
              >{`${form.properties.skjemanummer} - ${form.name} (${form.path})`}</li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
};

export default BulkPublishPanel;
