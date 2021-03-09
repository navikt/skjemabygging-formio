import React from "react";
import { styled } from "@material-ui/styles";
import { Link } from "react-router-dom";
import navCssVariables from "nav-frontend-core";
import { Undertittel } from "nav-frontend-typografi";
import { Hovedknapp } from "nav-frontend-knapper";

const NavBarContainer = styled("div")({
  backgroundColor: navCssVariables.navDypBlaLighten40,
  padding: "1rem 0 1rem 0",
});

const NavBarWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "auto 6.875rem",
  gridTemplateRows: "auto",
  gridColumnGap: "1.5rem",
  gridRowGap: "1rem",
  margin: "0 2rem",
  "@media screen and (min-width: 39em)": {
    gridTemplateColumns: "auto auto auto",
    maxWidth: "66rem",
  },
  "@media screen and (min-width: 68em)": {
    margin: "0 auto",
  },
});

export const NavBarTitle = styled(Undertittel)({
  color: "#fff",
  placeSelf: "center",
});

export const NavBarVenstre = styled("div")({
  gridColumn: "1 / 4",
  display: "flex",
  "@media screen and (min-width: 39em)": {
    gridColumn: "1 / 2",
  },
});

export const NavBarHoyre = styled("div")({
  placeSelf: "center",
  justifySelf: "end",
});

export const KnappWrapper = styled("div")({
  backgroundColor: "white",
  borderRadius: "0.125em",
  placeSelf: "center",
});

export const NavBar = ({ title, logout, visSkjemaliste, visLagNyttSkjema, onNew }) => {
  return (
    <NavBarContainer>
      <NavBarWrapper>
        <NavBarVenstre>
          <KnappWrapper>
            {visSkjemaliste && (
              <Link className="knapp knapp--standard knapp--mini" to="/forms">
                Skjemaliste
              </Link>
            )}
            {visLagNyttSkjema && <Hovedknapp onClick={onNew}>Lag nytt skjema</Hovedknapp>}
          </KnappWrapper>
        </NavBarVenstre>

        <NavBarTitle>{title}</NavBarTitle>
        <NavBarHoyre>
          <KnappWrapper>
            <Link className="knapp knapp--standard knapp--mini" to="/" onClick={logout}>
              Logg ut
            </Link>
          </KnappWrapper>
        </NavBarHoyre>
      </NavBarWrapper>
    </NavBarContainer>
  );
};
