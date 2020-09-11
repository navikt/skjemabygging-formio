import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {AppLayoutWithContext} from "../components/AppLayout";

export function TestFormPage({onPublishClick, publiserer, editFormUrl, form, onSave }) {
  const title = `${form.title}`;
  return (
    <AppLayoutWithContext
      navBarProps={{title: title, visSkjemaliste: true}}
      mainCol={<>
      <Link className="knapp" to={editFormUrl}>Rediger</Link>
        <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
        <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
        Publiser
        </Knapp>
      </>}>
      <NavForm form={form} options={{
        language: 'nb-NO',
        i18n: {
          'nb-NO': {
            alertMessage: '{{label}}: {{message}}',
            "error" : "Vennligst fiks følgende feil:",
            "invalid_date" :"{{field}} er ikke en gyldig dato.",
            "invalid_email" : "{{field}} må være en gyldig epost-adresse.",
            "invalid_regex" : "{{field}} passer ikke til uttrykket {{regex}}.",
            "mask" : "Dette er ikke et gyldig {{field}}.",
            "max" : "{{field}} kan ikke være større enn {{max}}.",
            "maxLength" : "{{field}} må være kortere enn {{length}} tegn.",
            "min" : "{{field}} kan ikke være mindre enn {{min}}.",
            "minLength" : "{{field}} må være lengre enn {{length}} tegn.",
            "next" : "Neste",
            "pattern" : "{{field}} stemmer ikke med {{pattern}}",
            "previous" : "Forrige",
            "required" : "Du må fylle ut dette feltet"
          }
        }
      }}/>
    </AppLayoutWithContext>
  );
}

