import merge from "lodash.merge";
import formioDialogStyles from "./formioDialogStyles";
import { formioFormStyles } from "@navikt/skjemadigitalisering-shared-components";
import formBuilderStyles from "./formbuilderStyles";
import formComponentsListStyles from "./formComponentsListStyles";
import formAreaStyles from "./formAreaStyles";
import cardStyling from "./cardStyling";
import miscellaneousFormBuilderStyling from "./miscellaneousFormBuilderStyling";

const builderStyles = {
  "@global": merge(
    miscellaneousFormBuilderStyling,
    cardStyling,
    formioFormStyles,
    formComponentsListStyles,
    formAreaStyles,
    formioDialogStyles,
    formBuilderStyles
  ),
};

export { builderStyles };
