import { makeStyles } from "@material-ui/styles";
import { AppConfigProvider, NavForm } from "@navikt/skjemadigitalisering-shared-components";
import { Mottaksadresse } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import cloneDeep from "lodash.clonedeep";
import { Fareknapp, Knapp } from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import { Undertittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import Column from "../components/layout/Column";

const useStyles = makeStyles({
  panel: {
    display: "flex",
  },
  panelContentMain: {
    flexGrow: 1,
  },
});

interface Props {
  mottaksadresse?: Mottaksadresse;
  onSubmitDone: Function;
  onEdit?: Function;
  onCancel: Function;
  onFormReady: Function;
  deleteMottaksadresse?: Function;
  editMode: boolean;
  loadingForm: boolean;
}

const MottaksadresseEditor = ({
  mottaksadresse,
  editMode,
  onEdit = () => {},
  onCancel,
  deleteMottaksadresse,
  onFormReady,
  onSubmitDone,
  loadingForm,
}: Props) => {
  const styles = useStyles();
  const [deleting, setDeleting] = useState<boolean>(false);

  const onDelete = () => {
    if (deleteMottaksadresse && mottaksadresse) {
      setDeleting(true);
      deleteMottaksadresse(mottaksadresse._id).catch(() => setDeleting(false));
    }
  };

  const featureToggles = { enableAutoComplete: true };

  return (
    <Panel border className={styles.panel} data-testid={`mottaksadressepanel-${mottaksadresse?._id || "new"}`}>
      <div className={styles.panelContentMain}>
        {editMode && (
          <>
            {!mottaksadresse && <Undertittel>Ny mottaksadresse</Undertittel>}
            <AppConfigProvider featureToggles={featureToggles}>
              <NavForm
                src={`${Formiojs.getProjectUrl()}/mottaksadresse`}
                submission={mottaksadresse ? cloneDeep(mottaksadresse) : undefined}
                onSubmitDone={onSubmitDone}
                formReady={onFormReady}
              />
            </AppConfigProvider>
          </>
        )}
        {(!editMode || loadingForm) && mottaksadresse && (
          <>
            <Undertittel>{mottaksadresse.data.adresselinje1}</Undertittel>
            <div>{mottaksadresse.data.adresselinje2}</div>
            <div>{mottaksadresse.data.adresselinje3}</div>
            <div>
              {mottaksadresse.data.postnummer} {mottaksadresse.data.poststed}
            </div>
            {mottaksadresse.data.temakoder && <div>Tema: {mottaksadresse.data.temakoder}</div>}
          </>
        )}
        <div>
          {(!editMode || loadingForm) && mottaksadresse && (
            <Knapp onClick={() => onEdit()} spinner={loadingForm}>
              Endre
            </Knapp>
          )}
          {!mottaksadresse && loadingForm && <div>Laster skjema...</div>}
        </div>
      </div>
      <Column>
        {editMode && !loadingForm && (
          <>
            {!!mottaksadresse && deleteMottaksadresse && (
              <Fareknapp onClick={onDelete} spinner={deleting}>
                Slett
              </Fareknapp>
            )}
            <Knapp onClick={() => onCancel()}>Avbryt</Knapp>
          </>
        )}
      </Column>
    </Panel>
  );
};

export default MottaksadresseEditor;
