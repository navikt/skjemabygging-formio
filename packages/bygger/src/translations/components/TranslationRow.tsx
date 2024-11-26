import { Table } from '@navikt/ds-react';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { TranslationLang, useEditTranslations } from '../../context/translations/EditTranslationsContext';
import { getInputHeightInRows } from '../utils/editGlobalTranslationsUtils';
import TranslationInput from './TranslationInput';
import useTranslationTableStyles from './styles';

interface Props {
  translation: FormsApiGlobalTranslation;
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

  console.log(!!error, error?.type === 'CONFLICT', error);

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
    console.log('onChange', { ...translation, [property]: value });
  };

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
            error={error?.type === 'CONFLICT' ? 'Kunne ikke lagres' : undefined}
            onChange={(event) => handleChange('nn', event.currentTarget.value)}
          />
        ) : (
          translation.nn
        )}
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        {isEditing ? (
          <TranslationInput
            label={'Engelsk'}
            defaultValue={translation.en}
            minRows={heightInRows}
            error={error?.type === 'CONFLICT' ? 'Kunne ikke lagres' : undefined}
            onChange={(event) => handleChange('en', event.currentTarget.value)}
          />
        ) : (
          translation.en
        )}
      </Table.DataCell>
    </Table.Row>
  );
};

export default TranslationRow;
