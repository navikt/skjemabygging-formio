import { MenuLink } from './MenuLink';

export const TranslationsMenu = () => {
  const basePath = '/oversettelser';
  return (
    <>
      <MenuLink to={`${basePath}/introside`} dataKey={'introside'} noIconStyling={true}>
        Introside
      </MenuLink>

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
