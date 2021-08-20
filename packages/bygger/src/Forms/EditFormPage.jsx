import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import { FormBuilderOptions } from "@navikt/skjemadigitalisering-shared-components";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";
import { useTranslations } from "../context/i18n";
import Row from "../components/layout/Row";
import Column from "../components/layout/Column";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import { Link } from "react-router-dom";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import ActionRow from "../components/layout/ActionRow";

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: "1 / 3",
  },
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

export function EditFormPage({ form, formSettingsUrl, testFormUrl, onSave, onChange, onPublish, onLogout }) {
  const { featureToggles } = useAppConfig();
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const [openModal, setOpenModal] = useModal(false);
  const { translationsForNavForm } = useTranslations();
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
            <Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>
            <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          </Column>
        </Row>
      </AppLayoutWithContext>

      <ConfirmPublishModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        form={form}
        translations={translationsForNavForm}
        onPublish={onPublish}
      />
    </>
  );
}
