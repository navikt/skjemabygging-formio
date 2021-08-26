import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./NavBar";
import { UserAlerterContext } from "../userAlerting";
import React from "react";

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

export const AppLayoutWithContext = (props) => {
  return (
    <UserAlerterContext.Consumer>
      {(userAlerter) => <AppLayout userAlerter={userAlerter} {...props} />}
    </UserAlerterContext.Consumer>
  );
};
