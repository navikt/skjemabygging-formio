import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Table } from '@navikt/ds-react';
import { htmlConverter, InnerHtml } from '@navikt/skjemadigitalisering-shared-components';
import {
  FormsApiFormTranslation,
  formsApiTranslations,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useContext, useEffect, useMemo, useState } from 'react';
import { EditTranslationContext } from '../../context/translations/types';
import { getInputHeightInRows } from '../utils/translationsUtils';
import TranslationInput from './TranslationInput';
import useTranslationTableStyles from './styles';

interface Props<Translation extends FormsApiFormTranslation> {
  translation: Translation;
  editContext: EditTranslationContext<Translation>;
}

const TranslationRow = <Translation extends FormsApiFormTranslation>({
  translation,
  editContext,
}: Props<Translation>) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateTranslation, errors, editState } = useContext(editContext);
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
      <Table.HeaderCell className={styles.column} scope="row">
        {isHtml ? <InnerHtml content={translation.nb ?? ''} /> : translation.nb}
      </Table.HeaderCell>
      <Table.DataCell className={styles.column}>
        {isEditing ? (
          <TranslationInput
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
