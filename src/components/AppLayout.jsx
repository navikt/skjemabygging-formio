import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./NavBar";
import {ActionRowWrapper, AlertCol, InnerGrid, LeftCol, MainCol} from "./ActionRow";
import {UserAlerterContext} from '../userAlerting';
import React, {useContext, useEffect, useState} from "react";

const LayoutContext = React.createContext();

const Col = ({children, contextSelector}) => {
  const context = useContext(LayoutContext);
  useEffect(() => {
    context[contextSelector](children);
  }, [children, context, contextSelector]);
  return null;
};

export const LeftColContent = ({children}) => <Col contextSelector="setLeftCol">{children}</Col>;
export const MainColContent = ({children}) => <Col contextSelector="setMainCol">{children}</Col>;
export const NavBarProps = ({...props}) => {
  const context = useContext(LayoutContext);
  useEffect(() => {
    context['setNavBarProps'](props);
  }, [props, context]);
  return null;
}



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

export const VrengtLayout = ({children}) => {
  const [leftColState, setLeftColState] = useState(<span>LeftCol default</span>);
  const [mainColState, setMainColState] = useState(<span>MainCol default</span>);
  const [navBarProps, setNavBarProps] = useState({});
  return <AppLayoutWithContext leftCol={leftColState} mainCol={mainColState} navBarProps={navBarProps}>
    <LayoutContext.Provider
      value={{setLeftCol: setLeftColState, setMainCol: setMainColState, setNavBarProps: setNavBarProps}}>
      {children}
    </LayoutContext.Provider>
  </AppLayoutWithContext>
}






