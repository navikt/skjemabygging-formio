import React from "react";
import { styled } from '@material-ui/styles';
import { Link } from "react-router-dom";

const NavBarWrapper = styled("div")({
  backgroundColor: "#E9E7E7",
  padding: "0.5rem"
});

export const MenuLink = styled(Link)({
  color: "#3E3832",
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

export const MenuTitle = styled("h2")({
  padding: "1rem",
  color: "#3E3832",
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
