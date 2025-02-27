import { GlobalTranslationMap, TranslationResource, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactElement, useMemo } from 'react';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import GlobalCsvLink from '../../old_translations/global/GlobalCsvLink';
import { mapFormsApiTranslationsToScopedTranslationMap } from '../utils/translationsUtils';

interface Props {
  language: 'en' | 'nn';
  children: ReactElement | string;
}

const ExportGlobalTranslationsButton = ({ language, children }: Props) => {
  const { translationsPerTag } = useGlobalTranslations();

  const translationsFormioFormat: GlobalTranslationMap = useMemo(() => {
    const resources: TranslationResource[] = Object.entries(translationsPerTag).map(([tag, translations]) => ({
      id: 'id',
      name: tag,
      scope: 'global',
      tag: tag as TranslationTag,
      translations: mapFormsApiTranslationsToScopedTranslationMap(translations, language),
    }));
    return { [language]: resources };
  }, [language, translationsPerTag]);

  return (
    <GlobalCsvLink allGlobalTranslations={translationsFormioFormat} languageCode={language}>
      {children}
    </GlobalCsvLink>
  );
};

export default ExportGlobalTranslationsButton;
