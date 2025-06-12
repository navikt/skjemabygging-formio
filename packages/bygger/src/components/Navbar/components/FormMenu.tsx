import { ChatExclamationmarkIcon, CogIcon, EyeIcon, GlobeIcon, PencilIcon } from '@navikt/aksel-icons';
import useUnsavedChangesModal from '../../../hooks/useUnsavedChangesModal';
import { MenuLink } from './MenuLink';

export const FormMenu = ({ formPath }) => {
  const { unsavedChangesModalContent, showUnsavedChangesModal } = useUnsavedChangesModal();

  return (
    <>
      <MenuLink to={`/forms/${formPath}/settings`} noIconStyling={false}>
        <CogIcon fontSize="1.5rem" role="presentation" />
        <span>Innstillinger</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/intropage`} noIconStyling={false}>
        <ChatExclamationmarkIcon fontSize="1.5rem" role="presentation" />
        <span>Introside</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/edit`} noIconStyling={false}>
        <PencilIcon fontSize="1.5rem" role="presentation" />
        <span>Rediger skjema</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/view/veiledning`} noIconStyling={false}>
        <EyeIcon fontSize="1.5rem" role="presentation" />
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
        <GlobeIcon fontSize="1.5rem" role="presentation" />
        <span>Oversettelser</span>
      </MenuLink>

      {unsavedChangesModalContent}
    </>
  );
};
