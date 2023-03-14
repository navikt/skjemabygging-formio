import { HomeFilled } from "@navikt/ds-icons";
import { Header } from "@navikt/ds-react-internal";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import AdminMenu from "./components/AdminMenu";
import { FormMenu } from "./components/FormMenu";
import NotificationDropdown from "./components/NotificationDropdown";
import { TranslationsMenu } from "./components/TranslationsMenu";
import UserMenu from "./components/UserMenu";
import { useNavBarStyles } from "./styles";

interface Props {
  formPath: string;
  visSkjemaMeny: boolean;
  visOversettelsesMeny: boolean;
}

export const NavBar = ({ formPath, visSkjemaMeny, visOversettelsesMeny }: Props) => {
  const { userData } = useAuth();
  const { config } = useAppConfig();
  const styles = useNavBarStyles();
  const showAdmin = userData?.isAdmin;
  return (
    <section>
      <Header className={config?.isDevelopment ? styles.navBarLocal : styles.navBar}>
        <Link className={styles.formsLink} to="/forms" aria-label="Gå til skjemaliste">
          <HomeFilled fontSize="1.5rem" role="presentation" />
        </Link>
        <div className={styles.navBarLinks}>
          {visSkjemaMeny && <FormMenu formPath={formPath} />}
          {visOversettelsesMeny && <TranslationsMenu />}
        </div>
        <div className={styles.headerMenus}>
          <NotificationDropdown />
          {showAdmin && <AdminMenu />}
          <UserMenu />
        </div>
      </Header>
      {config?.isDevelopment && <div className={styles.indicateLocalBorder} />}
    </section>
  );
};
