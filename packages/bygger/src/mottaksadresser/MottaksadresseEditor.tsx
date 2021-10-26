import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import Formiojs from "formiojs/Formio";
import cloneDeep from "lodash.clonedeep";
import { NavForm } from "@navikt/skjemadigitalisering-shared-components";
import { Fareknapp, Knapp } from "nav-frontend-knapper";
import { Undertittel } from "nav-frontend-typografi";
import Panel from 'nav-frontend-paneler';
import {MottaksadresseEntity} from "../hooks/mottaksadresser";
import Column from "../components/layout/Column";

const useStyles = makeStyles({
  panel: {
    display: "flex"
  },
  panelContentMain: {
    flexGrow: 1,
  }
});

interface Props {
  mottaksadresse?: MottaksadresseEntity;
  onSubmitDone: Function;
  onEdit?: Function;
  onCancel: Function;
  onFormReady: Function;
  deleteMottaksadresse?: Function;
  editMode: boolean;
  loadingForm: boolean;
}

const MottaksadresseEditor = (
  {
    mottaksadresse,
    editMode,
    onEdit = () => {},
    onCancel,
    deleteMottaksadresse,
    onFormReady,
    onSubmitDone,
    loadingForm,
  }: Props
) => {
  const styles = useStyles();
  const [deleting, setDeleting] = useState<boolean>(false);

  const onDelete = () => {
    if (deleteMottaksadresse && mottaksadresse) {
      setDeleting(true);
      deleteMottaksadresse(mottaksadresse._id);
    }
  }

  return (
    <Panel border className={styles.panel} data-testid={`mottaksadressepanel-${mottaksadresse?._id || "new"}`}>
      <div className={styles.panelContentMain}>
        {
          editMode && (
            <>
              {!mottaksadresse && <Undertittel>Ny mottaksadresse</Undertittel>}
              <NavForm
                src={`${Formiojs.getProjectUrl()}/mottaksadresse`}
                submission={mottaksadresse ? cloneDeep(mottaksadresse) : undefined}
                onSubmitDone={onSubmitDone}
                formReady={onFormReady}
              />
            </>
          )
        }
        {
          (!editMode || loadingForm) && mottaksadresse && (
            <>
              <Undertittel>{mottaksadresse.data.adresselinje1}</Undertittel>
              <div>{mottaksadresse.data.adresselinje2}</div>
              <div>{mottaksadresse.data.adresselinje3}</div>
              <div>{mottaksadresse.data.postnummer} {mottaksadresse.data.poststed}</div>
            </>
          )
        }
        <div>
          {
            (!editMode || loadingForm) && mottaksadresse && (
              <Knapp onClick={() => onEdit()} spinner={loadingForm}>Endre</Knapp>
            )
          }
          {
            !mottaksadresse && loadingForm && (
              <div>Laster skjema...</div>
            )
          }
        </div>
      </div>
      <Column>
        {
          editMode && !loadingForm && (
            <>
              { !!mottaksadresse && deleteMottaksadresse && (
                  <Fareknapp onClick={onDelete} spinner={deleting}>Slett</Fareknapp>
                )
              }
              <Knapp onClick={() => onCancel()}>Avbryt</Knapp>
            </>
          )
        }
      </Column>
    </Panel>
  );
}

export default MottaksadresseEditor;
