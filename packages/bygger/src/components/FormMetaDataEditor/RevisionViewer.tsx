import { BodyShort, Button, Dialog, HGrid, Link } from '@navikt/ds-react';
import { FormRevision } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import useForms from '../../api/useForms';
import Timestamp from '../../Forms/status/Timestamp';

type RevisionViewerProps = {
  formPath: string;
};

export const RevisionViewer = ({ formPath }: RevisionViewerProps) => {
  const revisions1 = { revision: 1, createdAt: Date(), publishedAt: Date() };

  const [revisions, setRevisions] = useState<FormRevision[] | undefined>(undefined);

  const { getRevisions } = useForms();

  useEffect(() => {
    (async () => {
      setRevisions(await getRevisions(formPath));
    })();
  }, [formPath]);

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
          {revisions?.map((revision) => (
            <HGrid columns={'1fr repeat(3, 3fr)'} key={'revision' + revision.revision}>
              <BodyShort>{revision.revision}</BodyShort>
              <Timestamp timestamp={revision.createdAt} />
              {revision.publishedAt !== undefined ? <Timestamp timestamp={revision.publishedAt} /> : '-'}
              <Link as={ReactRouterLink} to={{ pathname: formPath, search: `?revision=${revisions1.revision}` }}>
                Gå til revisjon
              </Link>
            </HGrid>
          ))}
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
