import merge from "lodash.merge";
import bootstrapFormInputStyles from "./bootstrapFormInputStyles";
import choicesStyles from "./choicesStyles";
import formioTableStyles from "./formioTableStyles";
import listGroupStyles from "./listGroupStyles";
import navFormStyle from "./navFormStyle";
import { bootstrapStyles } from "../../Forms/fyllUtRouterBootstrapStyles";

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
