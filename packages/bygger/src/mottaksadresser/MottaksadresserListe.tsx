import React, {useContext, useState} from "react";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import useMottaksadresser from "../hooks/useMottaksadresser";
import {makeStyles} from "@material-ui/styles";
import MottaksadresseEditor from "./MottaksadresseEditor";
import Column from "../components/layout/Column";
import {UserAlerterContext} from "../userAlerting";

const useStyles = makeStyles({
  mottaksadresser: {
    gridColumn: "2 / 3",
  },
  publishButton: {
    whiteSpace: "inherit"
  }
});

const MottaksadresserListe = () => {

  const styles = useStyles();
  const {mottaksadresseEntities, ready, errorMessage, loadMottaksadresser, deleteMottaksadresse, publishMottaksadresser} = useMottaksadresser();
  const [editAddressId, setEditAddressId] = useState<string | undefined>(undefined);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  const userAlerter = useContext(UserAlerterContext);
  const alertComponent = userAlerter.alertComponent();

  const onSubmitDone = () => {
    setEditAddressId(undefined);
    loadMottaksadresser();
  }

  const editMottaksadresse = id => {
    setLoadingForm(true);
    setEditAddressId(id);
  }

  const clearEditAddressId = () => {
    setEditAddressId(undefined);
  }

  const onPublish = () => {
    setPublishing(true);
    publishMottaksadresser()
      .finally(() => setPublishing(false));
  }

  return (
    <>
      <Column className={styles.mottaksadresser}>
        {!ready && "Laster mottaksadresser..."}
        {errorMessage}
        {
          editAddressId === 'new' && (
            <MottaksadresseEditor
              onSubmitDone={onSubmitDone}
              onCancel={clearEditAddressId}
              onFormReady={() => setLoadingForm(false)}
              loadingForm={loadingForm}
              editMode
            />
          )
        }
        {
          mottaksadresseEntities.map(entity => (
            <MottaksadresseEditor
              key={entity._id}
              mottaksadresse={entity}
              editMode={editAddressId === entity._id}
              onEdit={() => editMottaksadresse(entity._id)}
              onCancel={clearEditAddressId}
              onFormReady={() => setLoadingForm(false)}
              onSubmitDone={onSubmitDone}
              deleteMottaksadresse={deleteMottaksadresse}
              loadingForm={editAddressId === entity._id && loadingForm}
            />
          ))
        }
      </Column>
      <Column>
        <Hovedknapp onClick={onPublish} spinner={publishing} className={styles.publishButton}>
          Publiser mottaksadresser
        </Hovedknapp>
        <Knapp onClick={() => editMottaksadresse("new")}>
          Legg til ny
        </Knapp>
        {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
      </Column>
    </>
  );
}

export default MottaksadresserListe;
