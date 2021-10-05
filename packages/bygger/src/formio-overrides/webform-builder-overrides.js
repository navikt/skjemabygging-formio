import {Builders} from "formiojs";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

const WebformBuilder = Builders.builders.webform;
const originalRemoveComponent = WebformBuilder.prototype.removeComponent;
const originalEditComponent = WebformBuilder.prototype.editComponent;

WebformBuilder.prototype.removeComponent = function (component, parent, original) {
  if (!parent) {
    return;
  }
  let confirmationMessage;
  const dependentComponents = navFormUtils.findDependentComponents(original?.key || component.key, this.form);
  if (dependentComponents.length > 0) {
    confirmationMessage = "En eller flere andre komponenter har avhengighet til denne. Vil du fremdeles slette den?";
  }

  if (confirmationMessage && !window.confirm(this.t(confirmationMessage))) {
    return false;
  }
  return originalRemoveComponent.call(this, component, parent, original);
}

WebformBuilder.prototype.editComponent = function (component, parent, isNew, isJsonEdit, original, flags = {}) {
  if (!component.key) {
    return;
  }
  this.conditionalAlert = null;
  const dependentComponents = navFormUtils.findDependentComponents(original?.key || component.key, this.form);
  if (dependentComponents.length > 0) {
    this.conditionalAlert = {
      message: "Følgende komponenter har avhengighet til denne:",
      components: dependentComponents,
    }
  }
  originalEditComponent.call(this, component, parent, isNew, isJsonEdit, original, flags);
}
