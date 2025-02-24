import { LanguageIcon } from '@navikt/aksel-icons';
import { EditFilled, EyeFilled, SettingsFilled } from '@navikt/ds-icons';
import useUnsavedChangesModal from '../../../hooks/useUnsavedChangesModal';
import { MenuLink } from './MenuLink';

export const FormMenu = ({ formPath }) => {
  const { unsavedChangesModalContent, showUnsavedChangesModal } = useUnsavedChangesModal();

  return (
    <>
      <MenuLink to={`/forms/${formPath}/settings`} noIconStyling={false}>
        <SettingsFilled fontSize={'1.5rem'} role="presentation" />
        <span>Innstillinger</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/edit`} noIconStyling={false}>
        <EditFilled fontSize={'1.5rem'} role="presentation" />
        <span>Rediger skjema</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/view/veiledning`} noIconStyling={false}>
        <EyeFilled fontSize={'1.5rem'} role="presentation" />
        <span>Forhåndsvis</span>
      </MenuLink>

      <MenuLink
        to={`/forms/${formPath}/oversettelser`}
        noIconStyling={false}
        onClick={(e) =>
          showUnsavedChangesModal(e, {
            redirectTo: `/forms/${formPath}/oversettelser`,
          })
        }
      >
        <LanguageIcon fontSize={'1.5rem'} role="presentation" />
        <span>Oversettelser</span>
      </MenuLink>

      {unsavedChangesModalContent}
    </>
  );
};
