import { Button, Checkbox, Modal, TextField, VStack } from '@navikt/ds-react';
import { LinkData } from './ToolBar';

type Props = {
  dialogRef: React.RefObject<HTMLDialogElement>;
  linkData: LinkData;
  setLinkData: (linkData: LinkData) => void;
  onSubmit: (linkData: LinkData) => void;
};
export function LinkModal({ dialogRef, setLinkData, linkData, onSubmit }: Props) {
  return (
    <Modal ref={dialogRef} header={{ heading: 'Lenke' }} width={400} onClose={() => dialogRef.current?.close()}>
      <Modal.Body>
        <form
          method="dialog"
          id="skjema"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(linkData);
          }}
        >
          <VStack gap="4">
            <TextField
              label="Tittel"
              value={linkData?.title}
              onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
            />
            <TextField
              label="URL"
              value={linkData?.url}
              onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
            />
            <Checkbox
              checked={linkData?.openInNewTab}
              onChange={(e) => setLinkData({ ...linkData, openInNewTab: e.target.checked })}
            >
              Åpne i ny fane
            </Checkbox>
          </VStack>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button form="skjema">Lagre</Button>
        <Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
