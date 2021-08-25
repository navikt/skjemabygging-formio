import { AppLayoutWithContext } from "../components/AppLayout";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import React, { useContext } from "react";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { AmplitudeProvider } from "@navikt/skjemadigitalisering-shared-components";
import { useModal } from "../util/useModal";
import { makeStyles } from "@material-ui/styles";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import ActionRow from "../components/layout/ActionRow";
import { Link } from "react-router-dom";
import Row from "../components/layout/Row";
import Column from "../components/layout/Column";
import { UserAlerterContext } from "../userAlerting";

const useStyles = makeStyles({
  mainCol: {
    gridColumn: "2 / 3",
  },
});

export function FormSettingsPage({ editFormUrl, testFormUrl, form, onSave, onChange, onLogout, onPublish }) {
  const userAlerter = useContext(UserAlerterContext);
  const alertComponent = userAlerter.alertComponent();

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
            {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
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
