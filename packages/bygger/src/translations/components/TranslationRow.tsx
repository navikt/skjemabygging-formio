import { Table } from '@navikt/ds-react';
import { htmlUtils, InnerHtml } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { TranslationError } from '../../context/translations/utils/errorUtils';
import { getInputHeightInRows } from '../utils/translationsUtils';
import TranslationDisplayCell from './TranslationDisplayCell';
import TranslationInput from './TranslationInput';
import { useTranslationTableStyles } from './styles';

interface Props {
  translation: FormsApiTranslation;
  updateTranslation: (original: FormsApiTranslation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  editState: any;
}

const TranslationRow = ({ translation, updateTranslation, errors, editState }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
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

  const isHtml = htmlUtils.isHtmlString(translation.nb ?? '');
  const hasGlobalOverride = !!translation.globalTranslationId;

  return (
    <Table.Row className={isEditing ? '' : styles.clickableRow} onClick={handleRowClick}>
      {isHtml ? (
        <Table.DataCell className={styles.column}>
          <InnerHtml content={translation.nb ?? ''} />
        </Table.DataCell>
      ) : (
        <Table.HeaderCell className={styles.column} scope="row">
          {translation.nb}
        </Table.HeaderCell>
      )}
      {isEditing ? (
        <>
          <Table.DataCell className={styles.column}>
            <TranslationInput
              autoFocus
              label={'Nynorsk'}
              defaultValue={translation.nn}
              isHtml={isHtml}
              minRows={heightInRows}
              error={error?.message}
              onChange={(value) => {
                handleChange('nn', value);
              }}
            />
          </Table.DataCell>
          <Table.DataCell className={styles.column}>
            <TranslationInput
              label={'Engelsk'}
              defaultValue={translation.en}
              isHtml={htmlUtils.isHtmlString(translation.nb ?? '')}
              minRows={heightInRows}
              error={error?.message}
              onChange={(value) => handleChange('en', value)}
            />
          </Table.DataCell>
        </>
      ) : (
        <>
          <TranslationDisplayCell hasGlobalOverride={hasGlobalOverride} text={translation.nn} />
          <TranslationDisplayCell hasGlobalOverride={hasGlobalOverride} text={translation.en} />
        </>
      )}
    </Table.Row>
  );
};

export default TranslationRow;
