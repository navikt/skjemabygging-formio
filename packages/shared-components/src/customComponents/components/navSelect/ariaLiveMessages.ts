export const ariaLiveMessages = {
  guidance: (props) => {
    const { isSearchable, isMulti, isDisabled, tabSelectsValue, context } = props;
    switch (context) {
      case "menu":
        return `Bruk pil opp og ned for å bla${
          isDisabled ? "" : ", trykk Enter for å velge verdi med fokus"
        }, trykk Escape for å lukke nedtrekksmenyen${
          tabSelectsValue ? ", trykk Tab for å velge verdi og lukke nedtrekksmenyen" : ""
        }.`;
      case "input":
        return `${props["aria-label"] || "Nedtrekksmeny"} har fokus${
          isSearchable ? ", skriv tekst for å filtrere innholdet i listen" : ""
        }, trykk nedoverpil for å åpne nedtrekksmenyen${
          isMulti ? ", trykk venstrepil for å fokusere på valgte verdier" : ""
        }`;
      case "value":
        return "Bruk venstre og høyre for å veksle mellom valgte verdier, trykk på tilbaketasten for å fjerne gjeldende valgte verdi";
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
        return removedLabels.length ? `${removedLabels.join(", ")} er nå fjernet.` : "";
      case "select-option":
        return isDisabled ? `${label} er deaktivert, og kan ikke velges.` : `${label} er valgt.`;
      case "initial-input-focus":
        return label ? `${label} er valgt` : "Ingen verdi er valgt";
      default:
        return "";
    }
  },

  onFocus: (props) => {
    const { context, options, label = "", isDisabled, isSelected } = props;
    if (context === "menu" && options?.length) {
      const disabled = isDisabled ? " deaktivert" : "";
      const status = `${isSelected ? "valgt" : "ikke valgt"}${disabled}`;
      return `${label} har fokus, er ${status}.`;
    }
    return "";
  },

  onFilter: (props) => {
    const { inputValue, resultsMessage } = props;
    return `${resultsMessage}${inputValue ? " for søkeordet " + inputValue : ""}.`;
  },
};
