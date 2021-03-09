import { NoScrollWrapper, Pagewrapper } from "../Forms/components";
import { NavBar } from "./NavBar";
import { UserAlerterContext } from "../userAlerting";
import React from "react";
import { styled } from "@material-ui/styles";

const ActionRow = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0 2rem",
  "@media screen and (min-width: 23.75em)": {
    "&": {
      display: "grid",
      gridTemplateColumns: "14rem minmax(20rem, 50rem)",
      gridGap: "2rem",
      margin: "0 auto 1rem",
      maxWidth: "66rem",
      minHeight: "6.5rem",
      padding: "0 0 2rem",
      width: "calc(100% - 4rem)",
    },
  },
});

const MainCol = styled("div")({
  width: "100%",
  "& .list-inline": {
    display: "flex",
    flexDirection: "column",
    margin: "1rem 0",
  },
  "& .list-inline-item": {
    margin: "0.5rem 0",
  },
  "& .knapp": {
    display: "block",
    textAlign: "center",
    width: "100%",
  },
  "@media screen and (min-width: 23.875em)": {
    "& .list-inline": {
      margin: "0",
    },
    "& .list-inline-item:last-of-type": {
      marginBottom: "0",
    },
  },
  "@media screen and (min-width: 35.25em)": {
    gridColumn: "2",
    alignSelf: "end",
    justifySelf: "center",
    padding: "0",
    width: "100%",

    "& .list-inline": {
      display: "grid",
      gridGap: "1rem",
      gridTemplateColumns: "auto auto auto",
      marginBottom: "0",
    },
    "& .list-inline-item": {
      margin: "0",
    },
    "& .knapp": {
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  "@media screen and (min-width: 46.875em)": {
    "& .list-inline": {
      marginBottom: 0,
      gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
      maxWidth: "33rem",
    },
    "& .list-inline-item": {
      marginBottom: 0,
    },
    "& .knapp": {
      display: "block",
    },
  },
});

const LeftCol = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
});

const RightCol = styled("div")({
  gridColumn: "3",
  alignSelf: "end",
  justifySelf: "end",
});

const BasicAlertCol = ({ children, ...props }) => (
  <aside aria-live="polite" {...props}>
    {children}
  </aside>
);

const AlertCol = styled(BasicAlertCol)({
  gridColumn: "1 / 3",
  alignSelf: "end",
  justifySelf: "center",
  paddingBottom: "2rem",
});

export const AppLayout = ({ children, userAlerter, leftCol, mainCol, navBarProps, rightCol }) => {
  const alertComponent = userAlerter.alertComponent();
  return (
    <>
      <NoScrollWrapper>
        <NavBar {...navBarProps} />
        <ActionRow>
          <LeftCol>{leftCol}</LeftCol>
          <MainCol>{mainCol}</MainCol>
          {alertComponent && <AlertCol>{alertComponent()}</AlertCol>}
          <RightCol>{rightCol}</RightCol>
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
