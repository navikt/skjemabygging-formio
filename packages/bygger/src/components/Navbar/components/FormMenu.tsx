import { LanguageIcon } from '@navikt/aksel-icons';
import { EditFilled, EyeFilled, GlobeFilled, SettingsFilled } from '@navikt/ds-icons';
import { Tag } from '@navikt/ds-react';
import { useLanguageCodeFromURL } from '@navikt/skjemadigitalisering-shared-components';
import useUnsavedChangesModal from '../../../hooks/useUnsavedChangesModal';
import { MenuLink } from './MenuLink';

export const FormMenu = ({ formPath }) => {
  const currentLanguage = useLanguageCodeFromURL();
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
        to={`/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ''}`}
        noIconStyling={false}
        onClick={(e) =>
          showUnsavedChangesModal(e, {
            redirectTo: `/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ''}`,
          })
        }
      >
        <GlobeFilled fontSize={'1.5rem'} role="presentation" />
        <span>Språk</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/oversettelser`} noIconStyling={false}>
        <LanguageIcon fontSize={'1.5rem'} role="presentation" />
        <span>
          Oversettelser{' '}
          <Tag variant={'warning-moderate'} size={'xsmall'}>
            Beta
          </Tag>
        </span>
      </MenuLink>

      {unsavedChangesModalContent}
    </>
  );
};
