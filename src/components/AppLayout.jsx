import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./NavBar";
import { ActionRowWrapper, AlertCol, InnerGrid, LeftCol, MainCol } from "./ActionRow";
import { UserAlerterContext } from "../userAlerting";
import React, { useState } from "react";
import isEqual from "lodash.isequal";

const LayoutContext = React.createContext();

class Col extends React.Component {
  static contextType = LayoutContext;

  componentDidMount() {
    this.context[this.props.contextSelector](this.props.children);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.children, this.props.children)) {
      this.componentDidMount();
    }
  }

  render() {
    return null;
  }
}

export const LeftColContent = ({ children }) => <Col contextSelector="setLeftCol">{children}</Col>;
export const MainColContent = ({ children }) => <Col contextSelector="setMainCol">{children}</Col>;

export class NavBarProps extends React.Component {
  static contextType = LayoutContext;

  componentDidMount() {
    this.context.setNavBarProps(this.props);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps, this.props)) {
      this.componentDidMount();
    }
  }

  render() {
    return null;
  }
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
    <Pagewrapper>{children}</Pagewrapper>
  </>
);

export const AppLayoutWithContext = (props) => {
  return (
    <UserAlerterContext.Consumer>
      {(userAlerter) => <AppLayout userAlerter={userAlerter} {...props} />}
    </UserAlerterContext.Consumer>
  );
};

export const VrengtLayout = ({ children }) => {
  const [leftColState, setLeftColState] = useState(<div></div>);
  const [mainColState, setMainColState] = useState(<div></div>);
  const [navBarProps, setNavBarProps] = useState({});
  return (
    <AppLayoutWithContext leftCol={leftColState} mainCol={mainColState} navBarProps={navBarProps}>
      <LayoutContext.Provider
        value={{ setLeftCol: setLeftColState, setMainCol: setMainColState, setNavBarProps: setNavBarProps }}
      >
        {children}
      </LayoutContext.Provider>
    </AppLayoutWithContext>
  );
};
