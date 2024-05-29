import { EditFilled, EyeFilled, GlobeFilled, SettingsFilled } from '@navikt/ds-icons';
import { makeStyles, useLanguageCodeFromURL } from '@navikt/skjemadigitalisering-shared-components';
import useUnsavedChangesModal from '../../../hooks/useUnsavedChangesModal';
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
  const { unsavedChangesModalContent, showUnsavedChangesModal } = useUnsavedChangesModal();

  return (
    <>
      <MenuLink to={`/forms/${formPath}/settings`} noIconStyling={false}>
        <SettingsFilled fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Innstillinger</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/edit`} noIconStyling={false}>
        <EditFilled fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Rediger skjema</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/view/veiledning`} noIconStyling={false}>
        <EyeFilled fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Forhåndsvis</span>
      </MenuLink>

      <MenuLink
        to={`/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ''}`}
        noIconStyling={false}
        onClick={(e) =>
          showUnsavedChangesModal(e, {
            redirectTo: `/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ''}`,
          })
        }
      >
        <GlobeFilled fontSize={'1.5rem'} role="presentation" />
        <span className={styles.linkText}>Språk</span>
      </MenuLink>

      {unsavedChangesModalContent}
    </>
  );
};
