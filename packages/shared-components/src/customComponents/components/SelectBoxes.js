import SelectBoxes from "formiojs/components/selectboxes/SelectBoxes";
import SelectBoxesEditForm from "formiojs/components/selectboxes/SelectBoxes.form";
import { descriptionPositionField } from "./fields/descriptionPositionField";

class CheckboxPanelGruppe extends SelectBoxes {
  static editForm() {
    return SelectBoxesEditForm([
      {
        label: "Display",
        key: "display",
        components: [descriptionPositionField],
      },
    ]);
  }

  toggleChecked(event) {
    if (event.target.checked) {
      event.target.setAttribute("checked", "checked");
    } else {
      event.target.removeAttribute("checked");
    }
    event.target.setAttribute("aria-checked", event.target.checked);
  }

  onFocusedInput() {
    this.refs.wrapper.forEach((wrapper) => {
      if (wrapper.contains(document.activeElement)) {
        wrapper.classList.add("inputPanel--focused");
      }
    });
  }

  onBlurredInput() {
    this.refs.wrapper.forEach((wrapper) => {
      if (!wrapper.contains(document.activeElement)) {
        wrapper.classList.remove("inputPanel--focused");
      }
    });
  }

  attach(element) {
    super.attach(element);
    this.refs.input.forEach((input) => {
      input.addEventListener("change", this.toggleChecked);
      input.addEventListener("focus", () => this.onFocusedInput());
      input.addEventListener("blur", () => this.onBlurredInput());
    });
  }

  detach(element) {
    if (element && this.refs.input) {
      this.refs.input.forEach((input) => {
        input.removeEventListener("change", this.toggleChecked);
        input.removeEventListener("focus", () => this.onFocusedInput());
        input.removeEventListener("blur", () => this.onBlurredInput());
      });
    }
    super.detach(element);
  }
}

export default CheckboxPanelGruppe;
