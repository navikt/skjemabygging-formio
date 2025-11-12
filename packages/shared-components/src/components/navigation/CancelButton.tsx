import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import urlUtils from '../../util/url/url';
import ConfirmationModal from '../modal/confirmation/ConfirmationModal';
import { BaseButton } from './BaseButton';

export function CancelButton() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { translate } = useLanguages();
  const exitUrl = urlUtils.getExitUrl(window.location.href);

  return (
    <>
      <BaseButton
        onClick={{
          default: () => setIsDeleteModalOpen(true),
        }}
        variant="tertiary"
        label={{
          default: translate(TEXTS.grensesnitt.navigation.exit),
        }}
        role="button"
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        confirmType={'danger'}
        texts={TEXTS.grensesnitt.confirmCancelPrompt}
        exitUrl={exitUrl}
      />
    </>
  );
}
