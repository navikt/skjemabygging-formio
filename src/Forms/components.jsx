import {styled} from "@material-ui/styles";

export const Pagewrapper = styled("div")({
    padding: "2rem",
});
export const CenterAlignedActionRow = styled('div')({
    display: "flex",
    justifyContent: "center",
    '& *': {
        margin: 5,
    },
    padding: "1rem"
});
export const SlettSkjemaKnapp = styled("button")({
    float: "right",
    outline: "none",
    border: 0,
    padding: 0
});