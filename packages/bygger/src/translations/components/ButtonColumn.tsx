import { Button, VStack } from '@navikt/ds-react';
import UserFeedback from '../../components/UserFeedback';

const ButtonColumn = () => {
  return (
    <VStack gap="4">
      <Button onClick={() => {}} type="button" size="small">
        Lagre
      </Button>
      <Button variant="secondary" onClick={() => {}} type="button" size="small">
        Publisér
      </Button>
      <Button variant="tertiary" onClick={() => {}} type="button" size="small">
        Eksporter
      </Button>
      <UserFeedback />
    </VStack>
  );
};
export default ButtonColumn;
