import { styled } from "@material-ui/styles";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";

export const Pagewrapper = styled("div")({
  margin: "0 auto",
  padding: "2rem 2rem 0",
});

export const SlettKnapp = styled("button")({
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
