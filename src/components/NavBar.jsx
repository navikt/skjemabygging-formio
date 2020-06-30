import React from "react";
import { styled } from '@material-ui/styles';
import { Link } from "react-router-dom";
import navCssVariables from "nav-frontend-core";

const NavBarWrapper = styled("div")({
  backgroundColor: navCssVariables.navLysGra,
  padding: "0.5rem"
});

export const MenuLink = styled(Link)({
  "&:hover": {
    "text-decoration": "none"
  },
  "&:focus": {
    "background-color": "navy"
  },
  "text-decoration": "underline"
});

export const MenuItem = styled("span")({
  color: "white"
});

export const MenuTitle = styled("h2")({
  padding: "1rem",
  color: navCssVariables.navMorkGra,
  display: "flex",
  justifyContent: "center",
});

const MenuItems = styled("div")({
  display: "flex",
  justifyContent: "space-between"
});

export const NavBar = ({ children, title }) => {
  return (
    <NavBarWrapper>
      <MenuTitle>{title}</MenuTitle>
      <MenuItems>
        {children}
      </MenuItems>
    </NavBarWrapper>
  );
};
