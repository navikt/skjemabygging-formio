import { Alert, Table } from '@navikt/ds-react';
import { htmlUtils } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { TranslationError } from '../../context/translations/utils/errorUtils';
import { getInputHeightInRows } from '../utils/translationsUtils';
import { useTranslationTableStyles } from './styles';
import TranslationDisplayCell from './TranslationDisplayCell';
import TranslationDisplayHeaderCell from './TranslationDisplayHeaderCell';
import TranslationInput from './TranslationInput';

interface Props {
  translation: FormsApiTranslation;
  updateTranslation: (original: FormsApiTranslation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  editState: any;
  isKeyBased?: boolean;
}

const TranslationRow = ({ translation, updateTranslation, errors, editState, isKeyBased }: Props) => {
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

  const autoFocus = isKeyBased ? 'nb' : 'nn';
  const isHtml = htmlUtils.isHtmlString(translation.nb ?? '');
  const defaultHtmlTag = isHtml && htmlUtils.getHtmlTag(translation.nb ?? '') === 'P' ? 'p' : 'div';
  const hasGlobalOverride = !!translation.globalTranslationId;

  return (
    <Table.Row className={isEditing ? '' : styles.clickableRow} onClick={handleRowClick}>
      {isEditing ? (
        <>
          {isKeyBased ? (
            <Table.DataCell className={styles.column}>
              <TranslationInput
                autoFocus={autoFocus === 'nb'}
                label={'Bokmål'}
                defaultValue={translation.nb}
                isHtml={isHtml}
                defaultHtmlTag={defaultHtmlTag}
                minRows={heightInRows}
                error={error?.message}
                onChange={(value) => {
                  handleChange('nb', value);
                }}
              />
              <div className={styles.inputAdditionalInfo}>{translation.key}</div>
            </Table.DataCell>
          ) : (
            <TranslationDisplayHeaderCell hasGlobalOverride={isKeyBased && hasGlobalOverride} text={translation.nb} />
          )}
          <Table.DataCell className={styles.column}>
            <TranslationInput
              autoFocus={autoFocus === 'nn'}
              label={'Nynorsk'}
              defaultValue={translation.nn}
              isHtml={isHtml}
              defaultHtmlTag={defaultHtmlTag}
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
              isHtml={isHtml}
              defaultHtmlTag={defaultHtmlTag}
              minRows={heightInRows}
              error={error?.message}
              onChange={(value) => handleChange('en', value)}
            />
          </Table.DataCell>
        </>
      ) : (
        <>
          {translation.nb ? (
            <>
              <TranslationDisplayHeaderCell hasGlobalOverride={isKeyBased && hasGlobalOverride} text={translation.nb} />
              <TranslationDisplayCell hasGlobalOverride={hasGlobalOverride} text={translation.nn} />
              <TranslationDisplayCell hasGlobalOverride={hasGlobalOverride} text={translation.en} />
            </>
          ) : (
            <Table.DataCell colSpan={3}>
              <Alert
                variant="warning"
                size="small"
                inline
              >{`Bokmålstekst mangler for nøkkel: ${translation.key}`}</Alert>
            </Table.DataCell>
          )}
        </>
      )}
    </Table.Row>
  );
};

export default TranslationRow;
