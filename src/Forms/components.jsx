import { styled } from "@material-ui/styles";

export const Pagewrapper = styled("div")({
  margin: "0 auto",
  padding: "0 2rem",
});

export const SlettSkjemaKnapp = styled("button")({
  float: "right",
  outline: "none",
  border: 0,
  padding: 0,
});

export const NoScrollWrapper = styled("div")({
  backgroundColor: "white",
  position: "sticky",
  top: "0",
  zIndex: 1000,
});
