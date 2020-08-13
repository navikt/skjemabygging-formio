import { NavBar } from "../components/NavBar";
import { Pagewrapper } from "./components";
import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useState } from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { styled } from "@material-ui/styles";
import { ActionRowWrapper, MainCol, LeftCol, NoScrollWrapper} from "./ActionRow";

/*const EditWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 4fr 1fr",
  gridTemplateRows: "auto",
  columnGap: "1.5rem",
  padding: "1rem"
});

const MainCol = styled("div")({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "center",
});

const LeftCol = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  paddingLeft: "1.2rem"
});

const NoScrollWrapper = styled("div")({
  backgroundColor: "white",
  position: "sticky",
  top: "0",
  zIndex: 1,
});*/

export function EditFormPage({ form, testFormUrl, logout, onSave, onChange, onPublish }) {
  const title = `${form.title}`;

  const [publiserer, setPubliserer] = useState(false);

  const onPublishClick = async (form) => {
    setPubliserer(true);
    try {
      await onPublish(form);
    } finally {
      setPubliserer(false);
    }
  };

  return (
    <>
      <NoScrollWrapper>
        <NavBar title={title} visSkjemaliste={true} />
        <ActionRowWrapper>
          <LeftCol>
              <SkjemaVisningSelect form={form} onChange={onChange} />
          </LeftCol>
          <MainCol>
            <Link className="knapp" to={testFormUrl}>
              Test skjema
            </Link>
            <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
            <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
              Publiser skjema
            </Knapp>
          </MainCol>

        </ActionRowWrapper>
      </NoScrollWrapper>
      <Pagewrapper>
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
      </Pagewrapper>
    </>
  );
}
