import {NoScrollWrapper, Pagewrapper} from "../Forms/components";
import {NavBar} from "./NavBar";
import {UserAlerterContext} from '../userAlerting';
import React from "react";
import {styled} from "@material-ui/styles";

const ActionRowWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "5fr 1fr",
  columnGap: "1.5rem",
  padding: "1rem",
});

const InnerGrid = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "1.5rem",
});

const MainCol = styled("div")({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "center",
  paddingTop: "2rem",
});

const LeftCol = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  paddingLeft: "1.2rem",
});

const BasicAlertCol = ({children, ...props}) => (<aside aria-live="polite" {...props}>{children}</aside>);

const AlertCol = styled(BasicAlertCol)({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "start",
  padding: "2rem 1.2rem 0 0",
});

export const AppLayout = ({ children, userAlerter, leftCol, mainCol, navBarProps }) => {
  const alertComponent = userAlerter.alertComponent();
  return (
    <>
      <NoScrollWrapper>
        <NavBar {...navBarProps} />
        <ActionRowWrapper>
          <InnerGrid>
            <LeftCol>{leftCol}</LeftCol>
            <MainCol>{mainCol}</MainCol>
          </InnerGrid>
          <AlertCol>
            {alertComponent && alertComponent()}
          </AlertCol>
        </ActionRowWrapper>
      </NoScrollWrapper>
      <Pagewrapper>
        {children}
      </Pagewrapper>
    </>
  );
};

export const AppLayoutWithContext = (props) => {
  return <UserAlerterContext.Consumer>{userAlerter => <AppLayout userAlerter={userAlerter} {...props} />}</UserAlerterContext.Consumer>;
};



