import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Table } from '@navikt/ds-react';
import { FormsApiTranslation, formsApiTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useEditTranslations } from '../../context/translations/EditTranslationsContext';
import { getInputHeightInRows } from '../utils/translationsUtils';
import TranslationInput from './TranslationInput';
import useTranslationTableStyles from './styles';

interface Props {
  translation: FormsApiTranslation;
}

const TranslationRow = ({ translation }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateTranslation, errors, editState } = useEditTranslations();
  const styles = useTranslationTableStyles();
  const heightInRows = getInputHeightInRows(translation.nb ?? '');
  const error = useMemo(
    () => errors.find((error) => !error.isNewTranslation && error.key === translation.key),
    [errors, translation.key],
  );

  useEffect(() => {
    if (editState === 'SAVED' && !error) {
      setIsEditing(false);
    }
  }, [editState, error]);

  const handleRowClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleChange = (property: TranslationLang, value: string) => {
    updateTranslation(translation, property, value);
  };

  const hasGlobalOverride = formsApiTranslations.isFormTranslation(translation) && translation.globalTranslationId;

  return (
    <Table.Row className={isEditing ? '' : styles.clickableRow} onClick={handleRowClick}>
      <Table.HeaderCell className={styles.column} scope="row">
        {translation.nb}
      </Table.HeaderCell>
      <Table.DataCell className={styles.column}>
        {isEditing ? (
          <TranslationInput
            label={'Nynorsk'}
            defaultValue={translation.nn}
            minRows={heightInRows}
            error={error?.message}
            onChange={(event) => handleChange('nn', event.currentTarget.value)}
          />
        ) : (
          <>
            {hasGlobalOverride && (
              <PadlockLockedIcon
                className={styles.displayCellIcon}
                title="Globalt overstyrt oversettelse"
                fontSize="1.5rem"
              />
            )}
            {translation.nn}
          </>
        )}
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        {isEditing ? (
          <TranslationInput
            label={'Engelsk'}
            defaultValue={translation.en}
            minRows={heightInRows}
            error={error?.message}
            onChange={(event) => handleChange('en', event.currentTarget.value)}
          />
        ) : (
          <>
            {hasGlobalOverride && (
              <PadlockLockedIcon
                className={styles.displayCellIcon}
                title="Globalt overstyrt oversettelse"
                fontSize="1.5rem"
              />
            )}
            {translation.en}
          </>
        )}
      </Table.DataCell>
    </Table.Row>
  );
};

export default TranslationRow;
