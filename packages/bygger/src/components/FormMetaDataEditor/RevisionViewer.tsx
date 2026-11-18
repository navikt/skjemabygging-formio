import { Button, Dialog, Link, Table } from '@navikt/ds-react';
import { TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormRevision } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import useForms from '../../api/useForms';
import Timestamp from '../../Forms/status/Timestamp';

type RevisionViewerProps = {
  formPath: string;
};

export const RevisionViewer = ({ formPath }: RevisionViewerProps) => {
  const [revisions, setRevisions] = useState<FormRevision[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const { logger } = useAppConfig();

  const { getRevisions } = useForms();
  const { config } = useAppConfig();

  const loadRevisions = useCallback(async () => {
    if (loading) {
      try {
        setRevisions(await getRevisions(formPath));
      } catch (_e) {
        logger?.error('Could not load revisions.');
      } finally {
        setLoading(false);
      }
    }
  }, [formPath, getRevisions, loading, logger]);

  useEffect(() => {
    (async () => {
      await loadRevisions();
    })();
  }, [loadRevisions]);

  return (
    <Dialog>
      <Dialog.Trigger>
        <Button variant={'tertiary'} size={'small'}>
          Se skjemarevisjoner
        </Button>
      </Dialog.Trigger>
      <Dialog.Popup style={{ zIndex: '20000' }}>
        <Dialog.Header>
          <Dialog.Title>Skjemarevisjoner for {formPath}</Dialog.Title>
          <Dialog.Description></Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <Table stickyHeader>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope={'col'}>Revisjon</TableHeaderCell>
                <TableHeaderCell scope={'col'}>Opprettet</TableHeaderCell>
                <TableHeaderCell scope={'col'}>Publisert</TableHeaderCell>
                <TableHeaderCell scope={'col'}>Fyllut-lenke</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisions
                ?.sort((a, b) => b.revision - a.revision)
                .map((revision) => (
                  <TableRow key={'revision' + revision.revision}>
                    <TableHeaderCell scope={'row'}>{revision.revision}</TableHeaderCell>
                    <TableDataCell>
                      <Timestamp timestamp={revision.createdAt} />
                    </TableDataCell>
                    <TableDataCell>
                      {revision.publishedAt !== undefined ? <Timestamp timestamp={revision.publishedAt} /> : '-'}
                    </TableDataCell>
                    <TableDataCell>
                      <Link
                        as={ReactRouterLink}
                        to={`${config!.skjemadelingslenkeUrl}/${formPath}?revision=${revision.revision}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Gå til revisjon
                      </Link>
                    </TableDataCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
