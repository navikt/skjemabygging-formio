import { MenuLink } from './MenuLink';

export const TranslationsMenu = () => {
  return (
    <>
      <MenuLink to={`/oversettelser/skjematekster`} dataKey={'skjematekster'} noIconStyling={true}>
        Skjematekster
      </MenuLink>

      <MenuLink to={`/oversettelser/grensesnitt`} dataKey={'grensesnitt'} noIconStyling={true}>
        Grensesnitt
      </MenuLink>

      <MenuLink to={`/oversettelser/statiske-tekster`} dataKey={'statiske-tekster'} noIconStyling={true}>
        Statiske tekster
      </MenuLink>

      <MenuLink to={`/oversettelser/validering`} dataKey={'validering'} noIconStyling={true}>
        Validering
      </MenuLink>
    </>
  );
};
