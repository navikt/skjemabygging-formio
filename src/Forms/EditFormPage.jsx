import {NavBar} from "../components/NavBar";
import {Pagewrapper, CenterAlignedActionRow} from "./components";
import {Link} from "react-router-dom";
// import {SkjemaVisningSelect} from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {styled} from "@material-ui/styles";
import navCssVariables from "nav-frontend-core";

const NoScrollWrapper = styled("div")({
  backgroundColor: "white",
  position: "-webkit-sticky", /* Safari */
  position: "sticky",
  top: "0",
  zIndex: 1
});

export function EditFormPage({form, testFormUrl, logout, onSave, onChange, onPublish}) {
  const title = `${form.title}`
  return (
    <>
      <NoScrollWrapper>
        <NavBar title={title} visSkjemaliste={true} />
        <CenterAlignedActionRow>
          {/*<SkjemaVisningSelect form={form} onChange={onChange} />*/}
          <Link className="knapp" to={testFormUrl}>Test skjema</Link>
          <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
          <Knapp onClick={() => onPublish(form)}>Publiser skjema</Knapp>
        </CenterAlignedActionRow>
      </NoScrollWrapper>
      <Pagewrapper>
        {/*<FormMetadataEditor form={form} onChange={onChange}/>*/}
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions}/>

      </Pagewrapper>
    </>
  );
}