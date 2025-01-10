import { Button, VStack } from '@navikt/ds-react';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useContext, useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { EditTranslationContext } from '../../context/translations/types';

interface Props<Translation extends FormsApiTranslation> {
  editContext: EditTranslationContext<Translation>;
}

const TranslationButtonColumn = <Translation extends FormsApiTranslation>({ editContext }: Props<Translation>) => {
  const [isSaving, setIsSaving] = useState(false);
  const { saveChanges } = useContext(editContext);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveChanges();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack gap="4">
      <Button loading={isSaving} onClick={handleSave} type="button" size="small">
        Lagre
      </Button>
      <Button variant="secondary" disabled={isSaving} onClick={() => {}} type="button" size="small">
        Publisér
      </Button>
      <Button variant="tertiary" disabled={isSaving} onClick={() => {}} type="button" size="small">
        Eksporter
      </Button>
      <UserFeedback />
    </VStack>
  );
};
export default TranslationButtonColumn;
