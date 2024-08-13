import { Add } from '@navikt/ds-icons';
import { MenuLink } from './MenuLink';

export const ListMenu = () => {
  return (
    <>
      <MenuLink to={`/forms/new`} noIconStyling={false}>
        <Add fontSize={'1.5rem'} role="presentation" />
        <span>Nytt skjema</span>
      </MenuLink>
    </>
  );
};
