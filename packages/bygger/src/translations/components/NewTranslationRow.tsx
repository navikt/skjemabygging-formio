import { Table, TextField } from '@navikt/ds-react';
import { useEditTranslations } from '../../context/translations/EditTranslationsContext';
import useTranslationTableStyles from './styles';

const NewTranslationRow = () => {
  const { newTranslation, updateNewTranslation, errors } = useEditTranslations();
  const styles = useTranslationTableStyles();

  const missingKeyError = errors.find((error) => error.isNewTranslation && error.type === 'MISSING_KEY_VALIDATION');

  const error = errors.find((error) => error.key === newTranslation.key && error.type === 'CONFLICT');

  const handleChange = (property: 'nb' | 'nn' | 'en', value: string) => {
    updateNewTranslation(property, value);
  };

  return (
    <Table.Row>
      <Table.DataCell className={styles.column}>
        <TextField
          hideLabel
          label={'Bokmål'}
          value={newTranslation.nb}
          onChange={(event) => handleChange('nb', event.currentTarget.value)}
          error={missingKeyError?.message ?? error?.message}
        />
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        <TextField
          hideLabel
          label={'Nynorsk'}
          value={newTranslation.nn}
          onChange={(event) => handleChange('nn', event.currentTarget.value)}
        />
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        <TextField
          hideLabel
          label={'Engelsk'}
          value={newTranslation.en}
          onChange={(event) => handleChange('en', event.currentTarget.value)}
        />
      </Table.DataCell>
    </Table.Row>
  );
};

export default NewTranslationRow;
