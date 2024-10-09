import { Alert, Button, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import RowLayout from '../components/layout/RowLayout';
import SidebarLayout from '../components/layout/SidebarLayout';
import UserFeedback from '../components/UserFeedback';
import useMottaksadresser from '../hooks/useMottaksadresser';
import MottaksadresseTable from './MottaksadresseTable';

const MottaksadresserListe = () => {
  const { mottaksadresser, ready, errorMessage, publishMottaksadresser } = useMottaksadresser();
  // const [editAddressId, setEditAddressId] = useState<string | undefined>(undefined);
  // const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  // const onSubmitDone = () => {
  //   setEditAddressId(undefined);
  //   loadMottaksadresser();
  // };

  // const editMottaksadresse = (id) => {
  //   setLoadingForm(true);
  //   setEditAddressId(id);
  // };

  // const clearEditAddressId = () => {
  //   setEditAddressId(undefined);
  // };

  const onPublish = () => {
    setPublishing(true);
    publishMottaksadresser().finally(() => setPublishing(false));
  };

  return (
    <RowLayout
      right={
        <SidebarLayout noScroll={true}>
          <VStack gap="1">
            <Button onClick={onPublish} loading={publishing} size="small">
              Publiser mottaksadresser
            </Button>
            {/*<Button variant="secondary" onClick={() => editMottaksadresse('new')} type="button" size="small">*/}
            {/*  Legg til ny*/}
            {/*</Button>*/}
            <UserFeedback />
          </VStack>
        </SidebarLayout>
      }
    >
      <div>
        {!ready && 'Laster mottaksadresser...'}
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <MottaksadresseTable mottaksadresser={mottaksadresser} />
        {/*{editAddressId === 'new' && (*/}
        {/*  <MottaksadresseEditor*/}
        {/*    onSubmitDone={onSubmitDone}*/}
        {/*    onCancel={clearEditAddressId}*/}
        {/*    onFormReady={() => setLoadingForm(false)}*/}
        {/*    loadingForm={loadingForm}*/}
        {/*    editMode*/}
        {/*  />*/}
        {/*)}*/}
        {/*<VStack gap="2">*/}
        {/*  {mottaksadresser.map((entity) => (*/}
        {/*    <MottaksadresseEditor*/}
        {/*      key={entity._id}*/}
        {/*      mottaksadresse={entity}*/}
        {/*      editMode={editAddressId === entity._id}*/}
        {/*      onEdit={() => editMottaksadresse(entity._id)}*/}
        {/*      onCancel={clearEditAddressId}*/}
        {/*      onFormReady={() => setLoadingForm(false)}*/}
        {/*      onSubmitDone={onSubmitDone}*/}
        {/*      deleteMottaksadresse={deleteMottaksadresse}*/}
        {/*      loadingForm={editAddressId === entity._id && loadingForm}*/}
        {/*    />*/}
        {/*  ))}*/}
        {/*</VStack>*/}
      </div>
    </RowLayout>
  );
};

export default MottaksadresserListe;
