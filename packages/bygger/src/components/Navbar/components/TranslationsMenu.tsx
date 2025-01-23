import { useLanguageCodeFromURL } from '@navikt/skjemadigitalisering-shared-components';
import { MenuLink } from './MenuLink';

export const TranslationsMenu = ({ path }: { path?: string }) => {
  const currentLanguage = useLanguageCodeFromURL();
  const basePath = path ? path : `/translations/global/${currentLanguage}`;
  return (
    <>
      <MenuLink to={`${basePath}/skjematekster`} dataKey={'skjematekster'} noIconStyling={true}>
        Skjematekster
      </MenuLink>

      <MenuLink to={`${basePath}/grensesnitt`} dataKey={'grensesnitt'} noIconStyling={true}>
        Grensesnitt
      </MenuLink>

      <MenuLink to={`${basePath}/statiske-tekster`} dataKey={'statiske-tekster'} noIconStyling={true}>
        Statiske tekster
      </MenuLink>

      <MenuLink to={`${basePath}/validering`} dataKey={'validering'} noIconStyling={true}>
        Validering
      </MenuLink>
    </>
  );
};
