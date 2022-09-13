import { makeStyles } from "@material-ui/styles";
import { Knapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import PrimaryButtonWithSpinner from "../components/PrimaryButtonWithSpinner";
import UserFeedback from "../components/UserFeedback";
import { useModal } from "../util/useModal";
import PublishModalComponents from "./publish/PublishModalComponents";
import FormStatusPanel from "./status/FormStatusPanel";
import UnpublishButton from "./unpublish/UnpublishButton";

const useStyles = makeStyles({
  mainCol: {
    gridColumn: "2 / 3",
  },
  titleRow: {
    height: "79px",
  },
});

export function FormSettingsPage({ form, onSave, onChange, onPublish, onUnpublish, visSkjemaMeny }) {
  const title = `${form.title}`;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal(false);
  const styles = useStyles();

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Skjemainnstillinger",
        visSkjemaMeny: true,
        formPath: form.path,
      }}
    >
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
          <UnpublishButton onUnpublish={onUnpublish} form={form} />
          <PrimaryButtonWithSpinner onClick={() => onSave(form)}>Lagre</PrimaryButtonWithSpinner>
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
