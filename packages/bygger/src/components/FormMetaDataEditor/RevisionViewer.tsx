import { ActionMenu, Button, CopyButton, HStack, Link } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormRevision } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import useForms from '../../api/useForms';
import FormStatusIndicator from '../../Forms/status/FormStatusIndicator';
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
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button size={'small'} variant={'tertiary'}>
          Se revisjoner
        </Button>
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        {revisions
          ?.sort((a, b) => b.revision - a.revision)
          .map((revision) => (
            <ActionMenu.Item key={'revision-' + revision.revision}>
              <HStack align={'center'} gap={'space-8'}>
                <Link
                  href={`${config!.skjemadelingslenkeUrl}/${formPath}?revision=${revision.revision}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Timestamp timestamp={revision.createdAt} />
                </Link>
                {revision.publishedAt ? (
                  <FormStatusIndicator status={'PUBLISHED'} size={'small'} />
                ) : (
                  <FormStatusIndicator status={'UNPUBLISHED'} size={'small'} />
                )}
                <CopyButton size={'small'} copyText={'test'} />
              </HStack>
            </ActionMenu.Item>
          ))}
      </ActionMenu.Content>
    </ActionMenu>
  );
};
