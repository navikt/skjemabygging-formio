import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Table } from '@navikt/ds-react';
import { htmlConverter, InnerHtml } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation, formsApiTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { TranslationError } from '../../context/translations/utils/errorUtils';
import { getInputHeightInRows } from '../utils/translationsUtils';
import TranslationInput from './TranslationInput';
import useTranslationTableStyles from './styles';

interface Props<Translation extends FormsApiTranslation> {
  translation: Translation;
  updateTranslation: (original: Translation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  editState: any;
}

const TranslationRow = <Translation extends FormsApiTranslation>({
  translation,
  updateTranslation,
  errors,
  editState,
}: Props<Translation>) => {
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

  const isHtml = htmlConverter.isHtmlString(translation.nb ?? '');
  const hasGlobalOverride = formsApiTranslations.isFormTranslation(translation) && translation.globalTranslationId;

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
      <Table.DataCell className={styles.column}>
        {isEditing ? (
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
        ) : (
          <>
            {hasGlobalOverride && (
              <PadlockLockedIcon
                className={styles.displayCellIcon}
                title="Globalt overstyrt oversettelse"
                fontSize="1.5rem"
              />
            )}
            {isHtml ? <InnerHtml content={translation.nn ?? ''} /> : translation.nn}
          </>
        )}
      </Table.DataCell>
      <Table.DataCell className={styles.column}>
        {isEditing ? (
          <TranslationInput
            label={'Engelsk'}
            defaultValue={translation.en}
            isHtml={htmlConverter.isHtmlString(translation.nb ?? '')}
            minRows={heightInRows}
            error={error?.message}
            onChange={(value) => handleChange('en', value)}
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
            {isHtml ? <InnerHtml content={translation.en ?? ''} /> : translation.en}
          </>
        )}
      </Table.DataCell>
    </Table.Row>
  );
};

export default TranslationRow;
