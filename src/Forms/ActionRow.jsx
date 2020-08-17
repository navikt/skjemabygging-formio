import { styled } from '@material-ui/styles';

export const ActionRowWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 4fr 1fr",
  columnGap: "1.5rem",
  padding: "1rem"
});

export const MainCol = styled("div")({
  gridColumn: "2",
  alignSelf: "end",
  justifySelf: "center",
  paddingTop: "2rem"
});

export const LeftCol = styled("div")({
  gridColumn: "1",
  alignSelf: "end",
  justifySelf: "start",
  paddingLeft: "1.2rem"
});

export const RightCol = styled("div")({
  gridColumn: "3",
  alignSelf: "end",
  justifySelf: "start",
  padding: "2rem 1.2rem 0 0"
});


