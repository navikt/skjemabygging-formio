import { Add } from '@navikt/ds-icons';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { MenuLink } from './MenuLink';

const useStyles = makeStyles({
  linkText: {
    '@media (max-width: 1040px)': {
      display: 'none',
    },
  },
});

export const ListMenu = () => {
  const styles = useStyles();
  return (
    <>
      <MenuLink to={`/forms/new`} noIconStyling={false}>
        <Add fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Nytt skjema</span>
      </MenuLink>
    </>
  );
};
