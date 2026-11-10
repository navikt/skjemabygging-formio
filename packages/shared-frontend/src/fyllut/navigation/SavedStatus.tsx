import { BodyShort } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import styles from './SavedStatus.module.css';

const SavedStatus = () => {
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const savedDate = submission?.fyllutState?.mellomlagring?.savedDate;

  if (!savedDate) {
    return null;
  }

  return (
    <BodyShort as="div" size="small" textColor="subtle" className={styles.savedStatus}>
      {translate(TEXTS.grensesnitt.mostRecentSave)} {savedDate}
    </BodyShort>
  );
};

export default SavedStatus;
