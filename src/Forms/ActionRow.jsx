import { styled } from "@material-ui/styles";
import React from "react";
import PropTypes from "prop-types";


export const ActionRowWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "5fr 1fr",
  columnGap: "1.5rem",
  padding: "1rem",
});

export const InnerGrid = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "1.5rem",
});

export const MainCol = styled("div")({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "center",
  paddingTop: "2rem",
});

export const LeftCol = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  paddingLeft: "1.2rem",
});

export const AlertCol = styled("div")({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "start",
  padding: "2rem 1.2rem 0 0",
});

export const ActionRow = ({ userAlerter, children }) => (
  <ActionRowWrapper>
    <InnerGrid>{children}</InnerGrid>
    <AlertCol>{userAlerter.alertComponent()}</AlertCol>
  </ActionRowWrapper>
);

ActionRow.propTypes = {
  userAlerter: PropTypes.object.isRequired,
  children: PropTypes.array,
};
