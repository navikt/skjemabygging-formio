import { MenuLink, NavBar } from "../components/NavBar";
import { Pagewrapper } from "../components/Pagewrapper";
import { Link } from "react-router-dom";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useState} from "react";
import FormBuilderOptions from "../components/FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { styled } from "@material-ui/styles";
import AlertStripe from "nav-frontend-alertstriper";

export const RightAlignedActionRow = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  "& *": {
    margin: 5,
  },
});

export function EditFormPage({ form, testFormUrl, logout, onSave, onChange, onPublish }) {
  const title = `Rediger skjema: ${form.title}`;

  const [publiserer, setPubliserer] = useState(false);
  const [publiseringOK, setPubliseringOK] = useState();

  const onPublishClick = async (form) => {
    setPubliserer(true);
    const publishStatusResponse = await onPublish(form);
    setPubliseringOK(publishStatusResponse.ok);
    setPubliserer(false);
  };

  return (
    <>
      <NavBar title={title}>
        <MenuLink to="/forms">Skjemaer</MenuLink>
        <MenuLink to="/" onClick={logout}>
          Logg ut
        </MenuLink>
      </NavBar>
      <Pagewrapper>
        <RightAlignedActionRow>
          <button onClick={() => onSave(form)}>Lagre skjema</button>
          <Link to={testFormUrl}>Test skjema</Link>
        </RightAlignedActionRow>
        <FormMetadataEditor form={form} onChange={onChange} />
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
        <RightAlignedActionRow>
          <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
          <Link to={testFormUrl}>Test skjema</Link>
          <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
            Publiser skjema
          </Knapp>
          <div aria-live="polite">
            {publiseringOK !== undefined && (
              <>
                {publiseringOK ? (
                  <AlertStripe type="suksess" form="inline">
                    Begynner publisering
                  </AlertStripe>
                ) : (
                  <AlertStripe type="feil" form="inline">
                    Publisering feilet.
                  </AlertStripe>
                )}
              </>
            )}
          </div>
        </RightAlignedActionRow>
      </Pagewrapper>
    </>
  );
}
