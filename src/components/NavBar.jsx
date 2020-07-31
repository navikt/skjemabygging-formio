import React from "react";
import { styled } from '@material-ui/styles';
import { Link } from "react-router-dom";
import navCssVariables from "nav-frontend-core";
import { Hamburgerknapp } from 'nav-frontend-ikonknapper';
import { Undertittel } from 'nav-frontend-typografi';

const NavBarWrapper = styled("div")({
  backgroundColor: navCssVariables.navMorkGra,
  display: "grid",
  gridTemplateColumns: "1fr 4fr 1fr",
  gridTemplateRows: "10px 44px 10px",
});


export const NavBarTitle = styled(Undertittel)({
  color: "white",
  gridColumn: "2",
  gridRow: "2",
  placeSelf: "center"
});

export const NavBarVenstre = styled("div") ({
  // alignItems: "center",
  gridColumn: "1",
  gridRow: "2",
  placeSelf: "center",
  display: "flex"
});

export const NavBarHoyre = styled("div") ({
  gridColumn: "3",
  gridRow: "2",
  placeSelf: "center"
});

export const Lenke = styled(Link) ({
  backgroundColor: "white"
});

export const KnappWrapper = styled("div") ({
  backgroundColor: "white",
  borderRadius: "0.125em",
  placeSelf: "center"
});

export const NavBar = ({ title, logout, visSkjemaliste }) => {
  return (
    <NavBarWrapper>
      <NavBarVenstre>
        <KnappWrapper>
          {visSkjemaliste && <Link className="knapp knapp--standard knapp--mini" to="/forms"> Skjemaliste</Link>}
        </KnappWrapper>
        <KnappWrapper><Hamburgerknapp /></KnappWrapper>

      </NavBarVenstre>
      <NavBarTitle>{title}</NavBarTitle>
      <NavBarHoyre>
        <KnappWrapper>
          <Link className="knapp knapp--standard knapp--mini" to="/" onClick={logout}> Logg ut </Link>
        </KnappWrapper>
      </NavBarHoyre>
    </NavBarWrapper>
  );
};
