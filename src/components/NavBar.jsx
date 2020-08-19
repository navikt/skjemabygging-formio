import React from "react";
import { styled } from '@material-ui/styles';
import { Link } from "react-router-dom";
import navCssVariables from "nav-frontend-core";
import { Knapp } from 'nav-frontend-knapper';
import { Hamburgerknapp } from 'nav-frontend-ikonknapper';
import { Undertittel } from 'nav-frontend-typografi';

const NavBarWrapper = styled("div")({
  backgroundColor: navCssVariables.navLysGra,
  display: "grid",
  gridTemplateColumns: "1fr 4fr 1fr",
  gridTemplateRows: "3rem",
  columnGap: "1.5rem",
  padding: "1rem 0 1rem 0"
});

export const NavBarTitle = styled(Undertittel)({
  color: navCssVariables.navMorkGra,
  gridColumn: "2",
  placeSelf: "center",
});

export const NavBarVenstre = styled("div") ({
  gridColumn: "1",
  placeSelf: "center",
  display: "flex"
});

export const NavBarHoyre = styled("div") ({
  gridColumn: "3",
  placeSelf: "center"
});

export const KnappWrapper = styled("div") ({
  backgroundColor: "white",
  borderRadius: "0.125em",
  placeSelf: "center",
  marginLeft: "2.2rem"
});

export const MenyWrapper = styled("div") ({
  backgroundColor: "white",
  borderRadius: "0.125em",
  placeSelf: "center",
  marginLeft: "1rem"
});

const Cog = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      d="M23.5 10h-2.854c-.2-.79-.454-1.667-.778-2.332L21.9 5.636a.498.498 0 0 0 0-.708l-2.83-2.826a.499.499 0 0 0-.707 0l-2.032 2.031c-.665-.324-1.542-.578-2.331-.777V.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v2.856c-.789.199-1.666.453-2.331.777L5.637 2.102a.499.499 0 0 0-.707 0L2.101 4.929a.5.5 0 0 0 0 .707l2.033 2.033c-.323.662-.578 1.54-.779 2.331H.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h2.855c.2.791.455 1.668.778 2.331L2.1 18.364a.5.5 0 0 0 0 .708L4.93 21.9c.188.188.52.188.707 0l2.032-2.032c.663.322 1.54.577 2.331.778V23.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2.854c.791-.201 1.668-.456 2.331-.778l2.034 2.032a.5.5 0 0 0 .707 0l2.827-2.828a.499.499 0 0 0 0-.707l-2.032-2.033c.323-.663.578-1.54.778-2.331H23.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.501zM12 16c-2.205 0-4-1.795-4-4s1.795-4 4-4c2.206 0 4 1.795 4 4s-1.794 4-4 4z"
    />
  </svg>);


export const NavBar = ({ title, logout, visSkjemaliste, visHamburger, visInnstillinger }) => {
  return (
    <NavBarWrapper>
      <NavBarVenstre>
        <KnappWrapper>
          {visSkjemaliste && <Link className="knapp knapp--standard knapp--mini" to="/forms"> Skjemaliste</Link>}
        </KnappWrapper>
        <MenyWrapper>
          {visHamburger && <Hamburgerknapp />}
        </MenyWrapper>
        <MenyWrapper>
          {visInnstillinger && <Knapp className={"knapp knapp--standard knapp--kompakt"}>
            <Cog />
            <span className="sr-only">Knapp</span>
          </Knapp>}
        </MenyWrapper>
      </NavBarVenstre>
      <NavBarTitle>
        {title}
      </NavBarTitle>
      <NavBarHoyre>
        <KnappWrapper>
          <Link className="knapp knapp--standard knapp--mini" to="/" onClick={logout}> Logg ut </Link>
        </KnappWrapper>
      </NavBarHoyre>
    </NavBarWrapper>
  );
};

NavBar.defaultProps = {title: ''};
