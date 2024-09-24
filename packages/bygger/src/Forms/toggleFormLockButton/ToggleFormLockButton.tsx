import { BodyShort, Button, Textarea } from '@navikt/ds-react';
import { Modal } from '@navikt/skjemadigitalisering-shared-components';
import { FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';

interface Props {
  onChangeLockedState: (properties: Partial<FormPropertiesType>) => Promise<void>;
  isLockedForm?: boolean;
  lockedFormReason?: string;
}

const ToggleFormLockButton = ({ onChangeLockedState, isLockedForm, lockedFormReason }: Props) => {
  const [lockedFormState, setLockedFormState] = useState<{
    reasonValue: string;
    error?: string;
    isLoading: boolean;
    isModalOpen: boolean;
  }>({
    reasonValue: lockedFormReason ?? '',
    isLoading: false,
    isModalOpen: false,
  });

  const modalTitle = isLockedForm ? 'Låse opp skjemaet' : 'Lås skjemaet for redigering';
  const unlockFormBody = 'Er du sikker på at du vil låse opp skjemaet?';
  const confirmButtonText = isLockedForm ? 'Lås opp' : 'Lås for redigering';
  const cancelButtonText = 'Avbryt';

  const onClickConfirm = async () => {
    if (!isLockedForm && !lockedFormState.reasonValue) {
      setLockedFormState((state) => ({ ...state, error: 'Du må oppgi en grunn til at skjemaet skal låses' }));
    } else {
      setLockedFormState(({ error, ...rest }) => ({
        ...rest,
        isLoading: true,
      }));
      await onChangeLockedState({ isLockedForm: !isLockedForm, lockedFormReason: lockedFormState.reasonValue });
      setLockedFormState((state) => ({ ...state, isLoading: false, isModalOpen: false }));
    }
  };

  const showModal = (open: boolean) => {
    setLockedFormState((state) => ({ ...state, isModalOpen: open }));
  };

  return (
    <>
      <Button onClick={() => showModal(true)} variant="tertiary" type="button" size="small">
        {isLockedForm ? 'Lås opp skjemaet' : 'Lås for redigering'}
      </Button>
      <Modal open={lockedFormState.isModalOpen} onClose={() => showModal(false)} title={modalTitle}>
        <Modal.Body>
          {isLockedForm && <BodyShort>{unlockFormBody}</BodyShort>}
          {!isLockedForm && (
            <Textarea
              label="Beskriv hvorfor skjemaet er låst"
              id="lockedFormReason"
              value={lockedFormState.reasonValue}
              onChange={(event) => setLockedFormState((state) => ({ ...state, reasonValue: event.target.value }))}
              error={lockedFormState?.error}
              resize
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant={'primary'} loading={lockedFormState.isLoading} onClick={onClickConfirm}>
            {confirmButtonText}
          </Button>
          <Button variant="tertiary" onClick={() => showModal(false)}>
            {cancelButtonText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default ToggleFormLockButton;
