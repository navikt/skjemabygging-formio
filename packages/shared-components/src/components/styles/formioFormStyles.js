import merge from "lodash.merge";
import { bootstrapStyles } from "../../Forms/fyllUtRouterBootstrapStyles";
import bootstrapFormInputStyles from "./bootstrapFormInputStyles";
import choicesStyles from "./choicesStyles";
import formioTableStyles from "./formioTableStyles";
import listGroupStyles from "./listGroupStyles";
import navFormStyle from "./navFormStyle";

const formioFormStyles = {
  ".formio-form": merge(
    navFormStyle,
    bootstrapFormInputStyles,
    choicesStyles,
    formioTableStyles,
    listGroupStyles,
    bootstrapStyles
  ),
};

export default formioFormStyles;
