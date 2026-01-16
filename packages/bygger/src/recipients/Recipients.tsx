import { Button, VStack } from '@navikt/ds-react';
import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import RowLayout from '../components/layout/RowLayout';
import SidebarLayout from '../components/layout/SidebarLayout';
import UserFeedback from '../components/UserFeedback';
import { useRecipients } from '../context/recipients/RecipientsContext';
import RecipientTable from './RecipientTable';

const Recipients = () => {
  const { isReady, recipients, newRecipient, addNewRecipient } = useRecipients();

  if (!isReady) {
    return (
      <RowLayout
        right={
          <SidebarLayout noScroll={true}>
            <SkeletonList size={3} height={'4rem'} />
          </SidebarLayout>
        }
      >
        <SkeletonList size={8} height={'4rem'} />
      </RowLayout>
    );
  }

  return (
    <RowLayout
      right={
        <SidebarLayout noScroll={true}>
          <VStack gap="space-1">
            <Button variant="secondary" onClick={addNewRecipient} type="button" size="small" disabled={!!newRecipient}>
              Legg til ny
            </Button>
            <UserFeedback />
          </VStack>
        </SidebarLayout>
      }
    >
      <RecipientTable recipients={recipients} />
    </RowLayout>
  );
};

export default Recipients;
