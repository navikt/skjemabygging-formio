import { makeStyles } from "@material-ui/styles";
import { Edit, Eye, Globe, Settings } from "@navikt/ds-icons";
import { useLanguageCodeFromURL } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { MenuLink } from "./MenuLink";

const useStyles = makeStyles({
  navBarLinkIcon: {
    fontSize: "1.5rem",
  },
  linkText: {
    "@media (max-width: 1040px)": {
      display: "none",
    },
  },
});

export const FormMenu = ({ formPath }) => {
  const styles = useStyles();
  const currentLanguage = useLanguageCodeFromURL();
  return (
    <>
      <MenuLink to={`/forms/${formPath}/settings`} noIconStyling={false}>
        <Settings className={styles.navBarLinkIcon} role="presentation" />
        <span className={styles.linkText}>Innstillinger</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/view/veiledning`} noIconStyling={false}>
        <Eye className={styles.navBarLinkIcon} role="presentation" />
        <span className={styles.linkText}>Forhåndsvis</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/edit`} noIconStyling={false}>
        <Edit className={styles.navBarLinkIcon} role="presentation" />
        <span className={styles.linkText}>Rediger skjema</span>
      </MenuLink>

      <MenuLink to={`/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ""}`} noIconStyling={false}>
        <Globe className={styles.navBarLinkIcon} role="presentation" />
        <span className={styles.linkText}>Språk</span>
      </MenuLink>
    </>
  );
};
