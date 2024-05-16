import { Edit, Eye, Globe, Settings } from '@navikt/ds-icons';
import { makeStyles, useLanguageCodeFromURL } from '@navikt/skjemadigitalisering-shared-components';
import { MenuLink } from './MenuLink';

const useStyles = makeStyles({
  linkText: {
    '@media (max-width: 1040px)': {
      display: 'none',
    },
  },
});

export const FormMenu = ({ formPath }) => {
  const styles = useStyles();
  const currentLanguage = useLanguageCodeFromURL();
  return (
    <>
      <MenuLink to={`/forms/${formPath}/settings`} noIconStyling={false}>
        <Settings fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Innstillinger</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/edit`} noIconStyling={false}>
        <Edit fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Rediger skjema</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/view/veiledning`} noIconStyling={false}>
        <Eye fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Forhåndsvis</span>
      </MenuLink>

      <MenuLink to={`/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ''}`} noIconStyling={false}>
        <Globe fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Språk</span>
      </MenuLink>
    </>
  );
};
