import { styled } from "@material-ui/styles";
import navCssVariables from "nav-frontend-core";

export const Pagewrapper = styled("div")({
  margin: "0 auto",
  padding: "0 2rem",
});

export const SletteKnapp = styled("button")({
  float: "right",
  outline: "none",
  border: 0,
  padding: 0,
});

export const NoScrollWrapper = styled("div")({
  backgroundColor: navCssVariables.navGraBakgrunn,
  position: "sticky",
  top: "0",
  zIndex: 900,
});
