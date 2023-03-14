import React from "react";
import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./navbar/NavBar";

export const AppLayout = ({ children, navBarProps }) => {
  return (
    <>
      <NoScrollWrapper>
        <NavBar {...navBarProps} />
      </NoScrollWrapper>
      <Pagewrapper>{children}</Pagewrapper>
    </>
  );
};
