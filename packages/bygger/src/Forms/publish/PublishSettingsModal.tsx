import { Alert, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react';
import { ConfirmationModal, i18nUtils, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormPropertiesType, I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import languagesInNorwegian from '../../old_translations/languagesInNorwegian';
import { getFormTexts } from '../../old_translations/utils';
import FormStatus from '../status/FormStatus';
import { allLanguagesInNorwegian } from '../status/PublishedLanguages';
import Timestamp from '../status/Timestamp';
import { useStatusStyles } from '../status/styles';
import { determineStatusFromForm } from '../status/utils';

const useStatusPanelStyles = makeStyles({
  table: {
    width: '100%',
    marginBottom: '2rem',
    '& td': {
      paddingRight: 'var(--a-spacing-3)',
    },
  },
  languageList: {
    margin: 0,
    paddingLeft: 'var(--a-spacing-5)',
  },
});

interface Props {
  form: Form;
  open: boolean;
  onClose: () => void;
  onConfirm: (languageCodes: string[]) => void;
}

export const getCompleteTranslationLanguageCodeList = (
  allFormOriginalTexts: string[],
  translationsForNavForm: I18nTranslations,
): string[] => {
  const completeTranslationList: string[] = [];
  if (allFormOriginalTexts.length !== 0) {
    Object.keys(translationsForNavForm)
      // .filter((lang) => lang !== 'nb-NO')
      .forEach((languageCode) => {
        const incompleteTranslationList: string[] = allFormOriginalTexts.filter(
          (formText) => Object.keys(translationsForNavForm[languageCode]).indexOf(formText) < 0,
        );

        if (incompleteTranslationList.length === 0) {
          completeTranslationList.push(languageCode);
        }
      });
  }
  return completeTranslationList;
};

const PublishSettingsModal = ({ open, onClose, onConfirm, form }: Props) => {
  const { translations } = useFormTranslations();
  const [allFormOriginalTexts, setAllFormOriginalTexts] = useState<string[]>([]);
  const [completeTranslationLanguageCodeList, setCompleteTranslationLanguageCodeList] = useState<string[]>([]);
  const [checkedLanguages, setCheckedLanguages] = useState<string[]>([]);

  useEffect(() => {
    setAllFormOriginalTexts(
      getFormTexts(form).reduce((allTexts, texts) => {
        const { text } = texts;
        return [...allTexts, text];
      }, [] as string[]),
    );
  }, [form]);

  useEffect(() => {
    const i18n = i18nUtils.mapFormsApiTranslationsToI18n(translations);
    const completeTranslations = getCompleteTranslationLanguageCodeList(allFormOriginalTexts, i18n);
    setCompleteTranslationLanguageCodeList(completeTranslations);
    setCheckedLanguages([...completeTranslations, 'nb-NO']);
  }, [allFormOriginalTexts, translations]);

  const PublishStatusPanel = ({ formProperties }: { formProperties: FormPropertiesType }) => {
    const statusPanelStyles = useStatusPanelStyles();
    const statusStyles = useStatusStyles({});
    return (
      <table className={statusPanelStyles.table}>
        <thead>
          <tr>
            <th>Status</th>
            <th>Publiserte språk</th>
            <th>Sist lagret</th>
            <th>Sist publisert</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <FormStatus status={determineStatusFromForm(form)} size="large" />
            </td>
            <td>
              {formProperties.published && (
                <ul className={statusPanelStyles.languageList}>
                  <li>{allLanguagesInNorwegian['nb-NO']}</li>
                  {formProperties.publishedLanguages?.map((languageCode) => (
                    <li key={languageCode}>{languagesInNorwegian[languageCode]}</li>
                  ))}
                </ul>
              )}
            </td>
            <td>
              <Timestamp timestamp={formProperties.modified} />
              <p className={statusStyles.rowText}>{formProperties.modifiedBy}</p>
            </td>
            <td>
              <Timestamp timestamp={formProperties.published} />
              <p className={statusStyles.rowText}>{formProperties.publishedBy}</p>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const LanguagePublishCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox value={languageCode}>{`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}</Checkbox>
  );

  const IncompleteLanguageCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox value={languageCode} disabled>{`${
      languagesInNorwegian[languageCode]
    } (${languageCode.toUpperCase()})`}</Checkbox>
  );

  const isTranslationComplete = (languageCode: string) => completeTranslationLanguageCodeList.includes(languageCode);
  const isPreviouslyPublished = (languageCode: string) => form.properties.publishedLanguages?.includes(languageCode);

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={() =>
        onConfirm(completeTranslationLanguageCodeList.filter((languageCode) => checkedLanguages.includes(languageCode)))
      }
      texts={{
        title: 'Publiseringsinnstillinger',
        confirm: 'Publiser',
      }}
    >
      <PublishStatusPanel formProperties={form.properties} />
      <Heading level="2" size="medium">
        Hvilke språkversjoner skal publiseres?
      </Heading>
      <CheckboxGroup
        legend="Valgene inkluderer kun komplette språkversjoner."
        value={checkedLanguages}
        onChange={(checked) => {
          setCheckedLanguages(checked);
        }}
      >
        <Checkbox disabled value={'nb-NO'}>{`${allLanguagesInNorwegian['nb-NO']} (NB-NO)`}</Checkbox>
        {checkedLanguages.length > 0 &&
          Object.keys(languagesInNorwegian).map((languageCode) => {
            if (isTranslationComplete(languageCode)) {
              return <LanguagePublishCheckbox key={languageCode} languageCode={languageCode} />;
            } else if (isPreviouslyPublished(languageCode)) {
              return <IncompleteLanguageCheckbox key={languageCode} languageCode={languageCode} />;
            }
            return null;
          })}
      </CheckboxGroup>

      {Object.keys(languagesInNorwegian).map(
        (languageCode) =>
          isPreviouslyPublished(languageCode) &&
          (!isTranslationComplete(languageCode) || !checkedLanguages.includes(languageCode)) && (
            <Alert variant="error" key={`${languageCode}-alert`}>
              {`OBS! ${languagesInNorwegian[languageCode]} 
              (${languageCode.toUpperCase()}) vil bli avpublisert hvis du publiserer med disse innstillingene.`}
            </Alert>
          ),
      )}
    </ConfirmationModal>
  );
};

export default PublishSettingsModal;
