import { AppLayoutWithContext } from "../components/AppLayout";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import React from "react";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { AmplitudeProvider } from "@navikt/skjemadigitalisering-shared-components";
import { useModal } from "../util/useModal";
import { makeStyles, styled } from "@material-ui/styles";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import { FormEditNavigation } from "./FormEditNavigation";
import ActionRow from "../components/layout/ActionRow";
import { Link } from "react-router-dom";
import Row from "../components/layout/Row";
import Column from "../components/layout/Column";

const SettingsContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "800px",
});

const useStyles = makeStyles({
  mainCol: {
    gridColumn: "2 / 3",
  },
});

export function FormSettingsPage({ editFormUrl, testFormUrl, form, onSave, onChange, onLogout, onPublish }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);
  const styles = useStyles();

  return (
    <AppLayoutWithContext navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}>
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <ActionRow>
          <Link className="knapp" to={editFormUrl}>
            Rediger skjema
          </Link>
          <Link className="knapp" to={testFormUrl}>
            Forhåndsvis
          </Link>
        </ActionRow>
        <Row>
          <Column className={styles.mainCol}>
            <h1 className="typo-sidetittel">{title}</h1>
            <FormMetadataEditor form={form} onChange={onChange} />
          </Column>
          <Column>
            <Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>
            <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          </Column>
        </Row>
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
