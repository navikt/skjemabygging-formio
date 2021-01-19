import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./NavBar";
import { UserAlerterContext } from "../userAlerting";
import React from "react";
import { styled } from "@material-ui/styles";

const ActionRow = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 4fr 1fr",
  gridGap: "1.5rem",
  margin: "0 auto 1rem",
  maxWidth: "66rem",
});

const MainCol = styled("div")({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "center",
  "& .list-inline": {
    marginBottom: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
    maxWidth: "33rem",
  },
  "& .list-inline-item": {
    marginBottom: 0,
  },
  "& .knapp": {
    width: "10rem",
  },
});

const LeftCol = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  // paddingLeft: "1.2rem",
});

const BasicAlertCol = ({ children, ...props }) => (
  <aside aria-live="polite" {...props}>
    {children}
  </aside>
);

const AlertCol = styled(BasicAlertCol)({
  gridColumn: "2 / 3",
  alignSelf: "end",
  justifySelf: "center",
});

export const AppLayout = ({ children, userAlerter, leftCol, mainCol, navBarProps }) => {
  const alertComponent = userAlerter.alertComponent();
  return (
    <>
      <NoScrollWrapper>
        <NavBar {...navBarProps} />
        <ActionRow>
          <LeftCol>{leftCol}</LeftCol>
          <MainCol>{mainCol}</MainCol>
          <AlertCol>{alertComponent && alertComponent()}</AlertCol>
        </ActionRow>
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
