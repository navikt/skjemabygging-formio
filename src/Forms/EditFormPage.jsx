import {NavBar} from "../components/NavBar";
import {Pagewrapper} from "./components";
import {Link} from "react-router-dom";
import {SkjemaVisningSelect} from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {styled} from "@material-ui/styles";

const EditWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 4fr 1fr",
  gridTemplateRows: "30px 50px 10px",
  columnGap: "20px"
});

const MainCol = styled("div")({
  gridColumn: "2",
  gridRow: "2",
  alignSelf: "end",
  justifySelf: "center"
});

const LeftCol = styled("div") ({
  gridColumn: "1",
  gridRow: "2",
  alignSelf: "end",
  justifySelf: "center",
  display: "flex",
});

const RightCol = styled("div") ({
  gridColumn: "3",
  gridRow: "2",
  alignSelf: "end",
  justifySelf: "center"
});

// Midlertidig styling av <SkjemaVisningSelect> :p
var style = {
  width: "150px",
};

const NoScrollWrapper = styled("div")({
  backgroundColor: "white",
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
      <EditWrapper>
        <LeftCol>
          <div style={style}><SkjemaVisningSelect form={form} onChange={onChange} /></div>
        </LeftCol>
        <MainCol>
          <Link className="knapp" to={testFormUrl}>Test skjema</Link>
          <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
          <Knapp onClick={() => onPublish(form)}>Publiser skjema</Knapp>
        </MainCol>
        <RightCol />
      </EditWrapper>
      </NoScrollWrapper>
      <Pagewrapper>
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions}/>

      </Pagewrapper>
    </>
  );
}