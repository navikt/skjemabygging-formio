import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const { navSelect: SELECT_TEXTS } = TEXTS.grensesnitt;

export const ariaLiveMessages = (translate) => {
  return {
    guidance: (props) => {
      const { context } = props;
      switch (context) {
        case 'input':
          return translate(SELECT_TEXTS.inputHasFocus, {
            label: props['aria-label'] || translate(SELECT_TEXTS.defaultLabel),
          });
        default:
          return '';
      }
    },
    onChange: (props) => {
      const { action, label = '', isDisabled, removedValues = [] } = props;
      switch (action) {
        case 'deselect-option':
        case 'pop-value':
        case 'remove-value':
        case 'clear': {
          const removedLabels = removedValues.map((value) => value.label ?? value);
          return removedLabels.length
            ? translate(SELECT_TEXTS.optionDeselected, { label: removedLabels.join(', ') })
            : '';
        }
        case 'select-option':
          return isDisabled
            ? translate(SELECT_TEXTS.optionDisabled, { label })
            : translate(SELECT_TEXTS.optionSelected, { label });
        case 'initial-input-focus':
          return label ? translate(SELECT_TEXTS.optionSelected, { label }) : translate(SELECT_TEXTS.noOptionSelected);
        default:
          return '';
      }
    },

    onFocus: (props) => {
      const { context, options, label = '', isSelected } = props;
      if (context === 'menu' && options?.length) {
        return isSelected
          ? translate(SELECT_TEXTS.labelWithFocusSelected, { label })
          : translate(SELECT_TEXTS.labelWithFocusNotSelected, { label });
      }
      return '';
    },

    onFilter: (props) => {
      const { inputValue, resultsMessage } = props;
      return `${resultsMessage} ${inputValue ? translate(SELECT_TEXTS.onFilterSearchResult, { inputValue }) : ''}.`;
    },
  };
};
