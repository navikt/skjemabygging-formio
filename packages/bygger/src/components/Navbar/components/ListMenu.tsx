import { PlusIcon } from '@navikt/aksel-icons';
import { MenuLink } from './MenuLink';

export const ListMenu = () => {
  return (
    <>
      <MenuLink to={`/forms/new`} noIconStyling={false}>
        <PlusIcon fontSize={'1.5rem'} role="presentation" />
        <span>Nytt skjema</span>
      </MenuLink>
    </>
  );
};
