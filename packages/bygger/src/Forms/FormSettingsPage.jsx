import { makeStyles } from "@material-ui/styles";
import { Knapp } from "nav-frontend-knapper";
import { Sidetittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FormMetadataEditor } from "../components/FormMetaDataEditor/FormMetadataEditor";
import { isFormMetadataValid, validateFormMetadata } from "../components/FormMetaDataEditor/utils";
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
});

export function FormSettingsPage({
  form,
  publishedForm,
  onSave,
  onChange,
  onPublish,
  onUnpublish,
  visSkjemaMeny,
  validateAndSave,
}) {
  const title = form.title;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal(false);
  const styles = useStyles();
  const [errors, setErrors] = useState({});

  validateAndSave = async (form) => {
    const updatedErrors = validateFormMetadata(form);
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      return await onSave(form);
    } else {
      setErrors(updatedErrors);
    }
  };

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
          <Sidetittel className="margin-bottom-default">{title}</Sidetittel>
        </Column>
      </Row>
      <Row>
        <Column className={styles.mainCol}>
          <FormMetadataEditor form={form} publishedForm={publishedForm} errors={errors} onChange={onChange} />
        </Column>
        <Column>
          <Knapp onClick={() => setOpenPublishSettingModal(true)}>Publiser</Knapp>
          <UnpublishButton onUnpublish={onUnpublish} form={form} />
          <PrimaryButtonWithSpinner onClick={() => validateAndSave(form)}>Lagre</PrimaryButtonWithSpinner>
          <FormStatusPanel publishProperties={form.properties} />
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
