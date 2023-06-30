import { makeStyles, navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import PageWrapper from "../Forms/PageWrapper";
import { NavBar } from "./Navbar/NavBar";

const useStyles = makeStyles({
  noScroll: {
    backgroundColor: navCssVariables.navGraBakgrunn,
    position: "sticky",
    top: "0",
    zIndex: 900,
  },
});

export const AppLayout = ({ children, navBarProps }) => {
  const styles = useStyles();
  return (
    <>
      <div className={styles.noScroll}>
        <NavBar {...navBarProps} />
      </div>
      <PageWrapper>{children}</PageWrapper>
    </>
  );
};
