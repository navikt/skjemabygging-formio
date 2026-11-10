import { BodyShort, Button, Dialog, Link } from '@navikt/ds-react';
import { Link as ReactRouterLink } from 'react-router';

type RevisionViewerProps = {
  formPath: string;
};

export const RevisionViewer = ({ formPath }: RevisionViewerProps) => {
  const revisions = { revision: 1, createdAt: Date(), publishedAt: Date() };

  return (
    <Dialog>
      <Dialog.Trigger>
        <Button>Se skjemarevisjoner</Button>
      </Dialog.Trigger>
      <Dialog.Popup position={'bottom'}>
        <Dialog.Header>
          <Dialog.Title>Skjemarevisjoner for {formPath}</Dialog.Title>
          <Dialog.Description></Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <BodyShort>{revisions.revision}</BodyShort>
          <BodyShort>{revisions.createdAt}</BodyShort>
          <BodyShort>{revisions.publishedAt}</BodyShort>
          <Link as={ReactRouterLink} to={{ pathname: formPath, search: `?revision=${revisions.revision}` }}>
            Gå til revisjon
          </Link>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button>Lukk</Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
};
