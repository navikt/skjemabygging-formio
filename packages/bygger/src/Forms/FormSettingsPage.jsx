import { makeStyles } from "@material-ui/styles";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";
import { Link } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import ActionRow from "../components/layout/ActionRow";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import UserFeedback from "../components/UserFeedback";
import { useModal } from "../util/useModal";
import FormStatusPanel from "./FormStatusPanel";
import PublishModalComponents from "./PublishModalComponents";

const useStyles = makeStyles({
  mainCol: {
    gridColumn: "2 / 3",
  },
  titleRow: {
    height: "79px",
  },
});

export function FormSettingsPage({ editFormUrl, testFormUrl, form, onSave, onChange, onPublish }) {
  const title = `${form.title}`;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal(false);
  const styles = useStyles();

  return (
    <AppLayoutWithContext navBarProps={{ title: "Skjemainnstillinger", visSkjemaliste: true }}>
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
          <FormStatusPanel formProperties={form.properties} />
          <UserFeedback />
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
