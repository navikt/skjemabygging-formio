import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useContext } from "react";
import { FormBuilderOptions, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import { useModal } from "../util/useModal";
import Row from "../components/layout/Row";
import Column from "../components/layout/Column";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import { Link } from "react-router-dom";
import ActionRow from "../components/layout/ActionRow";
import { UserAlerterContext } from "../userAlerting";
import PublishModalComponents from "./PublishModalComponents";

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: "1 / 3",
  },
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

export function EditFormPage({ form, formSettingsUrl, testFormUrl, onSave, onChange, onPublish, onLogout }) {
  const userAlerter = useContext(UserAlerterContext);
  const alertComponent = userAlerter.alertComponent();
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
          logout: onLogout,
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
            <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
            {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
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
