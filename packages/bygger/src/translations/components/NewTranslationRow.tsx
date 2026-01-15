import { Table, TextField } from '@navikt/ds-react';
import { useEditGlobalTranslations } from '../../context/translations/EditGlobalTranslationsContext';
import { useTranslationTableStyles } from './styles';

const NewTranslationRow = () => {
  const { newTranslation, updateNewTranslation, errors } = useEditGlobalTranslations();
  const styles = useTranslationTableStyles();

  const missingKeyError = errors.find((error) => error.isNewTranslation && error.type === 'MISSING_KEY_VALIDATION');
  const error = errors.find((error) => error.key === newTranslation?.key);

  if (!newTranslation || !updateNewTranslation) {
    return <></>;
  }

  const handleChange = (property: 'nb' | 'nn' | 'en', value: string) => {
    updateNewTranslation(property, value);
  };

  return (
    <Table.Row>
      <Table.DataCell className={styles.column}>
        <TextField
          autoFocus
          className={missingKeyError || error ? 'aksel-text-field--error' : ''}
          hideLabel
          label={'Bokmål'}
          value={newTranslation.nb}
          onChange={(event) => handleChange('nb', event.currentTarget.value)}
        />
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        <TextField
          className={missingKeyError || error ? 'aksel-text-field--error' : ''}
          hideLabel
          label={'Nynorsk'}
          value={newTranslation.nn}
          onChange={(event) => handleChange('nn', event.currentTarget.value)}
        />
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        <TextField
          className={missingKeyError || error ? 'aksel-text-field--error' : ''}
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
