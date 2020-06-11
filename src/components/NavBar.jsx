import React from "react";
import { styled } from '@material-ui/styles';
import { Link } from "react-router-dom";

const NavBarWrapper = styled("div")({
  backgroundColor: "DimGray",
  padding: "0.5rem"
});

export const MenuLink = styled(Link)({
  color: "white",
  "&:hover": {
    color: "white",
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

export const MenuTitle = styled("h1")({
  color: "lightgreen"
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
