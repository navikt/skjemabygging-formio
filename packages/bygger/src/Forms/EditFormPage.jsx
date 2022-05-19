import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { FormBuilderOptions, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { Knapp } from "nav-frontend-knapper";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import React from "react";
import { Link } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import ActionRow from "../components/layout/ActionRow";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import NavFormBuilder from "../components/NavFormBuilder";
import PrimaryButtonWithSpinner from "../components/PrimaryButtonWithSpinner";
import UserFeedback from "../components/UserFeedback";
import { useModal } from "../util/useModal";
import FormStatusPanel from "./FormStatusPanel";
import PublishModalComponents from "./PublishModalComponents";

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: "1 / 3",
  },
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

export function EditFormPage({ form, formSettingsUrl, testFormUrl, onSave, onChange, onPublish }) {
  const { featureToggles } = useAppConfig();
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
          visSkjemaliste: true,
        }}
      >
        <ActionRow>
          {formSettingsUrl && (
            <Link className="knapp" to={formSettingsUrl}>
              Innstillinger
            </Link>
          )}
          <Link className="knapp" to={testFormUrl}>
            Forhåndsvis
          </Link>
          {featureToggles.enableTranslations && (
            <Link className="knapp" to={`/translations/${form.path}`}>
              Oversettelse
            </Link>
          )}
        </ActionRow>
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
