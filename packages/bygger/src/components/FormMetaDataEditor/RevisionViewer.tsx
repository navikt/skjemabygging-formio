import { BodyShort, Button, Dialog, HGrid, Link } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormRevision } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import useForms from '../../api/useForms';
import Timestamp from '../../Forms/status/Timestamp';

type RevisionViewerProps = {
  formPath: string;
};

export const RevisionViewer = ({ formPath }: RevisionViewerProps) => {
  const [revisions, setRevisions] = useState<FormRevision[] | undefined>(undefined);

  const { getRevisions } = useForms();
  const { config } = useAppConfig();

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
          <HGrid columns={'2fr repeat(3, 3fr)'}>
            <BodyShort>Revisjon</BodyShort>
            <BodyShort>Opprettet</BodyShort>
            <BodyShort>Publisert</BodyShort>
            <BodyShort>Fyllut-lenke</BodyShort>
          </HGrid>
          {revisions
            ?.sort((a, b) => a.revision - b.revision)
            .map((revision) => (
              <HGrid columns={'2fr repeat(3, 3fr)'} key={'revision' + revision.revision}>
                <BodyShort>{revision.revision}</BodyShort>
                <Timestamp timestamp={revision.createdAt} />
                {revision.publishedAt !== undefined ? <Timestamp timestamp={revision.publishedAt} /> : '-'}
                <Link as={ReactRouterLink} to={`${config!.fyllutBaseUrl}/${formPath}?revision=${revision.revision}`}>
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
