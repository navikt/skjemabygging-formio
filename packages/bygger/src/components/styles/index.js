import formioDialogStyles from "./formioDialogStyles";
import formioFormStyles from "./formioFormStyles";
import formBuilderStyles from "./formbuilderStyles";
import formComponentsListStyles from "./formComponentsListStyles";
import formAreaStyles from "./formAreaStyles";
import cardStyling from "./cardStyling";
import miscellaneousFormBuilderStyling from "./miscellaneousFormBuilderStyling";

const builderStyles = {
  "@global": {
    ...miscellaneousFormBuilderStyling,
    ...cardStyling,
    ...formioFormStyles,
    ...formComponentsListStyles,
    ...formAreaStyles,
    ...formioDialogStyles,
    ...formBuilderStyles,
  },
};

export { builderStyles };
