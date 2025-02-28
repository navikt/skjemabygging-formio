import { Alert, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react';
import { ConfirmationModal, i18nUtils, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form, I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
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
      .filter((lang) => lang !== 'nb-NO')
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
    const sanitizedCompleteTranslations = completeTranslations
      .map((langCode) => (langCode.length > 2 ? langCode.substring(0, 2) : langCode))
      .filter(skipBokmal);
    setCompleteTranslationLanguageCodeList([...sanitizedCompleteTranslations, 'nb']);
    setCheckedLanguages([...sanitizedCompleteTranslations, 'nb']);
  }, [allFormOriginalTexts, translations]);

  const PublishStatusPanel = ({ form }: { form: Form }) => {
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
              {(form.status === 'published' || form.status === 'pending') && (
                <ul className={statusPanelStyles.languageList}>
                  {form.publishedLanguages?.map((languageCode) => (
                    <li key={languageCode}>{allLanguagesInNorwegian[languageCode]}</li>
                  ))}
                </ul>
              )}
            </td>
            <td>
              <Timestamp timestamp={form.changedAt} />
              <p className={statusStyles.rowText}>{form.changedBy}</p>
            </td>
            <td>
              <Timestamp timestamp={form.publishedAt} />
              <p className={statusStyles.rowText}>{form.publishedBy}</p>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const LanguagePublishCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox
      value={languageCode}
    >{`${allLanguagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}</Checkbox>
  );

  const IncompleteLanguageCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox value={languageCode} disabled>{`${
      allLanguagesInNorwegian[languageCode]
    } (${languageCode.toUpperCase()})`}</Checkbox>
  );

  const isTranslationComplete = (languageCode: string) => completeTranslationLanguageCodeList.includes(languageCode);
  const isPreviouslyPublished = (languageCode: string) => form.publishedLanguages?.includes(languageCode);

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
      <PublishStatusPanel form={form} />
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
        <Checkbox disabled value="nb">{`${allLanguagesInNorwegian['nb']} (NB)`}</Checkbox>
        {checkedLanguages.length > 0 &&
          Object.keys(allLanguagesInNorwegian)
            .filter(skipBokmal)
            .map((languageCode) => {
              if (isTranslationComplete(languageCode)) {
                return <LanguagePublishCheckbox key={languageCode} languageCode={languageCode} />;
              } else if (isPreviouslyPublished(languageCode)) {
                return <IncompleteLanguageCheckbox key={languageCode} languageCode={languageCode} />;
              }
              return null;
            })}
      </CheckboxGroup>

      {Object.keys(allLanguagesInNorwegian)
        .filter(skipBokmal)
        .map(
          (languageCode) =>
            isPreviouslyPublished(languageCode) &&
            (!isTranslationComplete(languageCode) || !checkedLanguages.includes(languageCode)) && (
              <Alert variant="error" key={`${languageCode}-alert`}>
                {`OBS! ${allLanguagesInNorwegian[languageCode]} 
              (${languageCode.toUpperCase()}) vil bli avpublisert hvis du publiserer med disse innstillingene.`}
              </Alert>
            ),
        )}
    </ConfirmationModal>
  );
};

const skipBokmal = (code: string) => code !== 'nb';

export default PublishSettingsModal;
