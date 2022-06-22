import { makeStyles } from "@material-ui/styles";
import { StreetLightSize } from "./types";

const useStatusStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  statusRow: (props: { size?: StreetLightSize }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: props?.size === "large" ? "0.5rem" : 0,
  }),
  rowText: {
    flex: "1",
    margin: "0",
  },
  panelItem: {
    "&:not(:last-child)": {
      marginBottom: "2.5rem",
    },
  },
});

const useFormStatusIndicatorStyles = makeStyles({
  streetLight: (props: { size: StreetLightSize }) => ({
    maxWidth: props.size === "small" ? "1rem" : "1.5rem",
    height: props.size === "small" ? "1rem" : "1.5rem",
    borderRadius: "50%",
    marginRight: "0.75rem",
    flex: "1",
  }),
  published: {
    backgroundColor: "#219653",
  },
  pending: {
    backgroundColor: "#F2C94C",
  },
  draft: {
    backgroundColor: "#2D9CDB",
  },
  testform: {
    backgroundColor: "#EB5757",
  },
});

export { useStatusStyles, useFormStatusIndicatorStyles };
