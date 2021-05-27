import { Link } from "react-router-dom";
import React from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";
import { useModal } from "../util/useModal";
import ConfirmPublishModal from "./ConfirmPublishModal";

export function TestFormPage({ editFormUrl, form, onSave, onLogout, onPublish }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
      mainCol={
        <ul className="list-inline">
          <li className="list-inline-item">
            <Link className="knapp" to={editFormUrl}>
              Rediger
            </Link>
          </li>
          <li className="list-inline-item">
            <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          </li>
          <li className="list-inline-item">
            <Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>
          </li>
        </ul>
      }
    >
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <FyllUtRouter form={form} />
      </AmplitudeProvider>

      <ConfirmPublishModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        form={form}
        onPublish={onPublish}
      />
    </AppLayoutWithContext>
  );
}
