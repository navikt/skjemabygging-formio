import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";
import { Select } from "nav-frontend-skjema";

export function EditFormPage({ form, testFormUrl, onSave, onChange, onPublish, onLogout }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);

  return (
    <>
      <AppLayoutWithContext
        leftCol={<SkjemaVisningSelect form={form} onChange={onChange} />}
        mainCol={
          <ul className="list-inline">
            <li className="list-inline-item">
              <Link className="knapp" to={testFormUrl}>
                Test
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
        rightCol={
          <Select
            label="Velg oversettelser"
            name="form-language-select"
            id="form-language-select"
            value={form.language}
            onChange={(event) => onChange({ ...form, display: event.target.value })}
            bredde="s"
          >
            <option label="en">English</option>
            <option label="no">Norsk</option>
          </Select>
        }
        navBarProps={{
          title: title,
          visSkjemaliste: true,
          visHamburger: true,
          visInnstillinger: true,
          logout: onLogout,
        }}
      >
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
      </AppLayoutWithContext>

      <ConfirmPublishModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        form={form}
        onPublish={onPublish}
      />
    </>
  );
}
