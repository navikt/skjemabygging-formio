import React, {useState} from "react";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import useMottaksadresser from "../hooks/useMottaksadresser";
import {makeStyles} from "@material-ui/styles";
import MottaksadresseEditor from "./MottaksadresseEditor";
import Column from "../components/layout/Column";

const useStyles = makeStyles({
  mottaksadresser: {
    gridColumn: "2 / 3",
  }
});

const MottaksadresserListe = () => {

  const styles = useStyles();
  const {mottaksadresseEntities, ready, errorMessage, loadMottaksadresser, deleteMottaksadresse} = useMottaksadresser();
  const [editAddressId, setEditAddressId] = useState<string | undefined>(undefined);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);

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
        <Hovedknapp>Publiser</Hovedknapp>
        <Knapp onClick={() => editMottaksadresse("new")}>Legg til ny</Knapp>
      </Column>
    </>
  );
}

export default MottaksadresserListe;
