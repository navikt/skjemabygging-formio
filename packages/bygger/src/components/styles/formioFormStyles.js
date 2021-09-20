import merge from "lodash.merge";
import { navFormStyle, bootstrapStyles } from "@navikt/skjemadigitalisering-shared-components";
import formioTableStyles from "./formioTableStyles";
import bootstrapFormInputStyles from "./bootstrapFormInputStyles";

const formioFormStyles = {
  ".formio-form": merge(navFormStyle, bootstrapFormInputStyles, formioTableStyles, bootstrapStyles),
};

export default formioFormStyles;
