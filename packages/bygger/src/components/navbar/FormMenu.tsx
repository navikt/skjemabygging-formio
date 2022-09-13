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
      <MenuLink to={`/forms/${formPath}/settings`} ariaLabel={"Innstillinger"} noIconStyling={false}>
        <Settings className={styles.navBarLinkIcon} alt="Tannhjul: ikon for innstillinger" />
        <span className={styles.linkText}>Innstillinger</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/view/veiledning`} ariaLabel={"Veiledning"} noIconStyling={false}>
        <Eye className={styles.navBarLinkIcon} alt="Øye: ikon for forhåndsvis" />
        <span className={styles.linkText}>Forhåndsvis</span>
      </MenuLink>

      <MenuLink to={`/forms/${formPath}/edit`} ariaLabel={"Rediger skjema"} noIconStyling={false}>
        <Edit className={styles.navBarLinkIcon} alt="Skjemaliste" />
        <span className={styles.linkText}>Rediger skjema</span>
      </MenuLink>

      <MenuLink
        to={`/translations/${formPath}${currentLanguage ? `/${currentLanguage}` : ""}`}
        ariaLabel={"Språk"}
        noIconStyling={false}
      >
        <Globe className={styles.navBarLinkIcon} alt="Språk" />
        <span className={styles.linkText}>Språk</span>
      </MenuLink>
    </>
  );
};
