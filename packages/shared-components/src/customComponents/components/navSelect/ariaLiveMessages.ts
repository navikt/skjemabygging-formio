import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

const { navSelect: SELECT_TEXTS } = TEXTS.grensesnitt;

export const ariaLiveMessages = (translate) => {
  return {
    guidance: (props) => {
      const { isSearchable, isMulti, isDisabled, tabSelectsValue, context } = props;
      switch (context) {
        case "menu":
          const menuLines = [translate(SELECT_TEXTS.guidance.contextMenu.navigationArrows)];
          if (!isDisabled) {
            menuLines.push(translate(SELECT_TEXTS.guidance.contextMenu.navigationEnter));
          }
          menuLines.push(translate(SELECT_TEXTS.guidance.contextMenu.navigationEscape));
          if (tabSelectsValue) {
            menuLines.push(translate(SELECT_TEXTS.guidance.contextMenu.navigationTab));
          }
          return menuLines.join(" ");
        case "input":
          const lines = [
            translate(SELECT_TEXTS.inputHasFocus, {
              label: props["aria-label"] || translate(SELECT_TEXTS.defaultLabel),
            }),
          ];
          if (isSearchable) {
            lines.push(translate(SELECT_TEXTS.inputIsSearchable));
          }
          lines.push(translate(SELECT_TEXTS.inputUseArrows));
          if (isMulti) {
            lines.push(translate(SELECT_TEXTS.inputIsMulti));
          }
          return lines.join(" ");
        case "value":
          return translate(SELECT_TEXTS.valueNavigation);
        default:
          return "";
      }
    },
    onChange: (props) => {
      const { action, label = "", isDisabled, removedValues = [] } = props;
      switch (action) {
        case "deselect-option":
        case "pop-value":
        case "remove-value":
        case "clear":
          const removedLabels = removedValues.map((value) => value.label ?? value);
          return removedLabels.length
            ? translate(SELECT_TEXTS.optionDeselected, { label: removedLabels.join(", ") })
            : "";
        case "select-option":
          return isDisabled
            ? translate(SELECT_TEXTS.optionDisabled, { label })
            : translate(SELECT_TEXTS.optionSelected, { label });
        case "initial-input-focus":
          return label ? translate(SELECT_TEXTS.optionSelected, { label }) : translate(SELECT_TEXTS.noOptionSelected);
        default:
          return "";
      }
    },

    onFocus: (props) => {
      const { context, options, label = "", isSelected } = props;
      if (context === "menu" && options?.length) {
        return isSelected
          ? translate(SELECT_TEXTS.labelWithFocusSelected, { label })
          : translate(SELECT_TEXTS.labelWithFocusNotSelected, { label });
      }
      return "";
    },

    onFilter: (props) => {
      const { inputValue, resultsMessage } = props;
      return `${resultsMessage} ${inputValue ? translate(SELECT_TEXTS.onFilterSearchResult, { inputValue }) : ""}.`;
    },
  };
};
