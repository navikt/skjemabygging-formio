import {styled} from "@material-ui/styles";

export const Pagewrapper = styled("div")({
    padding: "2rem"
});
export const RightAlignedActionRow = styled('div')({
    display: "flex",
    justifyContent: "flex-end",
    '& *': {
        margin: 5,
    },
});
export const SlettSkjemaKnapp = styled("button")({
    float: "right",
    outline: "none",
    border: 0,
    padding: 0
});