import { AppLayoutWithContext } from "../components/AppLayout";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import React, { useContext } from "react";
import { useModal } from "../util/useModal";
import { makeStyles } from "@material-ui/styles";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import ActionRow from "../components/layout/ActionRow";
import { Link } from "react-router-dom";
import Row from "../components/layout/Row";
import Column from "../components/layout/Column";
import { UserAlerterContext } from "../userAlerting";
import { Undertittel } from "nav-frontend-typografi";
import PublishModalComponents from "./PublishModalComponents";

const useStyles = makeStyles({
  mainCol: {
    gridColumn: "2 / 3",
  },
  titleRow: {
    height: "79px",
  },
});

export function FormSettingsPage({ editFormUrl, testFormUrl, form, onSave, onChange, onLogout, onPublish }) {
  const userAlerter = useContext(UserAlerterContext);
  const alertComponent = userAlerter.alertComponent();

  const title = `${form.title}`;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal(false);
  const styles = useStyles();

  return (
    <AppLayoutWithContext navBarProps={{ title: "Skjemainnstillinger", visSkjemaliste: true, logout: onLogout }}>
      <ActionRow>
        <Link className="knapp" to={editFormUrl}>
          Rediger skjema
        </Link>
        <Link className="knapp" to={testFormUrl}>
          Forhåndsvis
        </Link>
      </ActionRow>
      <Row className={styles.titleRow}>
        <Column className={styles.mainCol}>
          <Undertittel tag="h1">{title}</Undertittel>
        </Column>
      </Row>
      <Row>
        <Column className={styles.mainCol}>
          <FormMetadataEditor form={form} onChange={onChange} />
        </Column>
        <Column>
          <Knapp onClick={() => setOpenPublishSettingModal(true)}>Publiser</Knapp>
          <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
        </Column>
      </Row>

      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </AppLayoutWithContext>
  );
}
