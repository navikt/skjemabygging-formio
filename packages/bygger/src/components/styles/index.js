import merge from "lodash.merge";
import cardStyling from "./cardStyling";
import formAreaStyles from "./formAreaStyles";
import formComponentsListStyles from "./formComponentsListStyles";
import formBuilderStyles from "./formbuilderStyles";
import formioDialogStyles from "./formioDialogStyles";

const builderStyles = {
  "@global": merge(cardStyling, formComponentsListStyles, formAreaStyles, formioDialogStyles, formBuilderStyles),
};

export { builderStyles };
