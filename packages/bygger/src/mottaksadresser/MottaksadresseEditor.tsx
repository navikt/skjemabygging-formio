import { Button, Heading, Panel } from '@navikt/ds-react';
import { AppConfigProvider, NavForm, NavFormioJs, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Mottaksadresse } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import { useState } from 'react';
import Column from '../components/layout/Column';

const useStyles = makeStyles({
  panel: {
    display: 'flex',
  },
  panelContentMain: {
    flexGrow: 1,
  },
});

interface Props {
  mottaksadresse?: Mottaksadresse;
  onSubmitDone: () => void;
  onEdit?: () => void;
  onCancel: () => void;
  onFormReady: () => void;
  deleteMottaksadresse?: (mottaksadresseId: string) => Promise<void>;
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

  return (
    <Panel border className={styles.panel} data-testid={`mottaksadressepanel-${mottaksadresse?._id || 'new'}`}>
      <div className={styles.panelContentMain}>
        {editMode && (
          <>
            {!mottaksadresse && (
              <Heading level="2" size="small">
                Ny mottaksadresse
              </Heading>
            )}
            <AppConfigProvider>
              <NavForm
                src={`${NavFormioJs.Formio.getProjectUrl()}/mottaksadresse`}
                submission={mottaksadresse ? cloneDeep(mottaksadresse) : undefined}
                onSubmitDone={onSubmitDone}
                formReady={onFormReady}
              />
            </AppConfigProvider>
          </>
        )}
        {(!editMode || loadingForm) && mottaksadresse && (
          <div className="mb-4">
            <Heading level="2" size="small">
              {mottaksadresse.data.adresselinje1}
            </Heading>
            <div>{mottaksadresse.data.adresselinje2}</div>
            <div>{mottaksadresse.data.adresselinje3}</div>
            <div>
              {mottaksadresse.data.postnummer} {mottaksadresse.data.poststed}
            </div>
            {mottaksadresse.data.temakoder && <div>Tema: {mottaksadresse.data.temakoder}</div>}
          </div>
        )}
        <div>
          {(!editMode || loadingForm) && mottaksadresse && (
            <Button variant="secondary" onClick={() => onEdit()} loading={loadingForm} type="button" size="small">
              Endre
            </Button>
          )}
          {!mottaksadresse && loadingForm && <div>Laster skjema...</div>}
        </div>
      </div>
      <Column>
        {editMode && !loadingForm && (
          <>
            {!!mottaksadresse && deleteMottaksadresse && (
              <Button variant="danger" onClick={onDelete} loading={deleting} type="button">
                Slett
              </Button>
            )}
            <Button variant="secondary" onClick={() => onCancel()} type="button">
              Avbryt
            </Button>
          </>
        )}
      </Column>
    </Panel>
  );
};

export default MottaksadresseEditor;
