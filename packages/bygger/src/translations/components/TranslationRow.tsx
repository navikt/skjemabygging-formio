import { Table } from '@navikt/ds-react';
import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useEditTranslations } from '../../context/translations/EditTranslationsContext';
import { getInputHeightInRows } from '../utils/editGlobalTranslationsUtils';
import TranslationInput from './TranslationInput';
import useTranslationTableStyles from './styles';

interface Props {
  translation: FormsApiGlobalTranslation;
  canEditNB?: boolean;
}

const TranslationRow = ({ translation, canEditNB = false }: Props) => {
  const { onTranslationChange } = useEditTranslations();
  const styles = useTranslationTableStyles();

  const rows = getInputHeightInRows(translation.nb ?? '');

  const handleChange = (property: 'nb' | 'nn' | 'en', value: string) => {
    onTranslationChange(translation, property, value);
    console.log('onChange', { ...translation, [property]: value });
  };

  return (
    <Table.Row>
      {canEditNB ? (
        <Table.DataCell className={styles.column}>
          <TranslationInput
            label={'Bokmål'}
            defaultValue={translation.nb}
            minRows={rows}
            onChange={(event) => handleChange('nb', event.currentTarget.value)}
          />
        </Table.DataCell>
      ) : (
        <Table.HeaderCell className={styles.column} scope="row">
          {translation.nb}
        </Table.HeaderCell>
      )}
      <Table.DataCell className={styles.column}>
        <TranslationInput
          label={'Nynorsk'}
          defaultValue={translation.nn}
          minRows={rows}
          onChange={(event) => handleChange('nn', event.currentTarget.value)}
        />
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        <TranslationInput
          label={'Engelsk'}
          defaultValue={translation.en}
          minRows={rows}
          onChange={(event) => handleChange('en', event.currentTarget.value)}
        />
      </Table.DataCell>
    </Table.Row>
  );
};

export default TranslationRow;
