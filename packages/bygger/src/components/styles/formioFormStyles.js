import merge from "lodash.merge";
import { navFormStyle, bootstrapStyles } from "@navikt/skjemadigitalisering-shared-components";
import formioTableStyles from "./formioTableStyles";
import bootstrapFormInputStyles from "./bootstrapFormInputStyles";
import listGroupStyles from "./listGroupStyles";

const formioFormStyles = {
  ".formio-form": merge(navFormStyle, bootstrapFormInputStyles, formioTableStyles, listGroupStyles, bootstrapStyles),
};

export default formioFormStyles;
