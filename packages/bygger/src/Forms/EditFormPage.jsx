import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { FormBuilderOptions } from "@navikt/skjemadigitalisering-shared-components";
import { Knapp } from "nav-frontend-knapper";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import React from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import NavFormBuilder from "../components/NavFormBuilder";
import PrimaryButtonWithSpinner from "../components/PrimaryButtonWithSpinner";
import UserFeedback from "../components/UserFeedback";
import { useModal } from "../util/useModal";
import PublishModalComponents from "./publish/PublishModalComponents";
import FormStatusPanel from "./status/FormStatusPanel";
import UnpublishButton from "./unpublish/UnpublishButton";

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: "1 / 3",
  },
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

export function EditFormPage({
  form,
  formSettingsUrl,
  testFormUrl,
  visSkjemaMeny,
  editFormUrl,
  onSave,
  onChange,
  onPublish,
  onUnpublish,
}) {
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal(false);
  const styles = useStyles();
  return (
    <>
      <AppLayoutWithContext
        navBarProps={{
          title: "Rediger skjema",
          visSkjemaMeny: true,
          links: [
            {
              label: "Innstillinger",
              url: formSettingsUrl,
            },
            {
              label: "Forhåndsvis",
              url: testFormUrl,
            },
            {
              label: "Rediger skjema",
              url: editFormUrl,
            },
            {
              label: "Språk",
              url: `/translations/${form.path}`,
            },
          ],
        }}
      >
        <Row>
          <SkjemaVisningSelect form={form} onChange={onChange} />
          <Column className={styles.centerColumn}>
            <Undertittel>{title}</Undertittel>
            <Normaltekst>{skjemanummer}</Normaltekst>
          </Column>
        </Row>
        <Row>
          <NavFormBuilder
            className={styles.formBuilder}
            form={form}
            onChange={onChange}
            formBuilderOptions={FormBuilderOptions}
          />
          <Column>
            <Knapp onClick={() => setOpenPublishSettingModal(true)}>Publiser</Knapp>
            <UnpublishButton onUnpublish={onUnpublish} form={form} />
            <PrimaryButtonWithSpinner onClick={() => onSave(form)}>Lagre</PrimaryButtonWithSpinner>
            <FormStatusPanel formProperties={form.properties} />
            <UserFeedback />
          </Column>
        </Row>
      </AppLayoutWithContext>

      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </>
  );
}
