import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./NavBar";
import {ActionRowWrapper, AlertCol, InnerGrid, LeftCol, MainCol} from "./ActionRow";
import {UserAlerterContext} from '../userAlerting';
import React from "react";

export const AppLayout = ({ children, userAlerter, leftCol, mainCol, navBarProps }) => (
  <>
    <NoScrollWrapper>
      <NavBar {...navBarProps} />
      <ActionRowWrapper>
        <InnerGrid>
          <LeftCol>{leftCol}</LeftCol>
          <MainCol>{mainCol}</MainCol>
        </InnerGrid>
        <AlertCol>{userAlerter.alertComponent()}</AlertCol>
      </ActionRowWrapper>
    </NoScrollWrapper>
    <Pagewrapper>
      {children}
    </Pagewrapper>
  </>
);

export const AppLayoutWithContext = (props) => {
  return <UserAlerterContext.Consumer>{userAlerter => <AppLayout userAlerter={userAlerter} {...props} />}</UserAlerterContext.Consumer>;
}



