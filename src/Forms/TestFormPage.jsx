import { Link } from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import i18nData from "../i18nData";

export function TestFormPage({ onPublishClick, publiserer, editFormUrl, form, onSave }) {
  const title = `${form.title}`;
  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true }}
      mainCol={
        <>
          <Link className="knapp" to={editFormUrl}>
            Rediger
          </Link>
          <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
            Publiser
          </Knapp>
        </>
      }
    >
      <NavForm
        form={form}
        onNextPage={() => {
          const nextPageTitle = document.querySelector(".typo-innholdstittel");
          nextPageTitle.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          nextPageTitle.focus();
        }}
        options={{
          language: "nb-NO",
          i18n: i18nData,
        }}
      />
    </AppLayoutWithContext>
  );
}
