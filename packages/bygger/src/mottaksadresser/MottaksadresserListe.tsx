import { Alert, Button } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import useMottaksadresser from '../hooks/useMottaksadresser';
import MottaksadresseEditor from './MottaksadresseEditor';

const useStyles = makeStyles({
  mottaksadresser: {
    gridColumn: '2 / 3',
  },
  publishButton: {
    whiteSpace: 'inherit',
  },
});

const MottaksadresserListe = () => {
  const styles = useStyles();
  const { mottaksadresser, ready, errorMessage, loadMottaksadresser, deleteMottaksadresse, publishMottaksadresser } =
    useMottaksadresser();
  const [editAddressId, setEditAddressId] = useState<string | undefined>(undefined);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  const onSubmitDone = () => {
    setEditAddressId(undefined);
    loadMottaksadresser();
  };

  const editMottaksadresse = (id) => {
    setLoadingForm(true);
    setEditAddressId(id);
  };

  const clearEditAddressId = () => {
    setEditAddressId(undefined);
  };

  const onPublish = () => {
    setPublishing(true);
    publishMottaksadresser().finally(() => setPublishing(false));
  };

  return (
    <>
      <Column className={styles.mottaksadresser}>
        {!ready && 'Laster mottaksadresser...'}
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
        {editAddressId === 'new' && (
          <MottaksadresseEditor
            onSubmitDone={onSubmitDone}
            onCancel={clearEditAddressId}
            onFormReady={() => setLoadingForm(false)}
            loadingForm={loadingForm}
            editMode
          />
        )}
        {mottaksadresser.map((entity) => (
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
        ))}
      </Column>
      <Column>
        <Button onClick={onPublish} loading={publishing} className={styles.publishButton} size="small">
          Publiser mottaksadresser
        </Button>
        <Button variant="secondary" onClick={() => editMottaksadresse('new')} type="button" size="small">
          Legg til ny
        </Button>
        <UserFeedback />
      </Column>
    </>
  );
};

export default MottaksadresserListe;
