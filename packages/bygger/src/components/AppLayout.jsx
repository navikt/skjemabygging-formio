import React from "react";
import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { UserAlerterContext } from "../userAlerting";
import { NavBar } from "./navbar/NavBar";

export const AppLayout = ({ children, navBarProps, formMenuProps }) => {
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
