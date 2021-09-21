import merge from "lodash.merge";
import { navFormStyle, bootstrapStyles } from "@navikt/skjemadigitalisering-shared-components";
import formioTableStyles from "./formioTableStyles";
import bootstrapFormInputStyles from "./bootstrapFormInputStyles";
import listGroupStyles from "./listGroupStyles";
import choicesStyles from "./choicesStyles";

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
