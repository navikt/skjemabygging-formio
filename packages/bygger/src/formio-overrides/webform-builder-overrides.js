import {Builders} from "formiojs";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

const WebformBuilder = Builders.builders.webform;
const originalRemoveComponent = WebformBuilder.prototype.removeComponent;
const originalEditComponent = WebformBuilder.prototype.editComponent;
const originalDestroy = WebformBuilder.prototype.destroy;

WebformBuilder.prototype.removeComponent = function (component, parent, original) {
  if (!parent) {
    return;
  }
  if (original && original.id) {
    let confirmationMessage;
    const dependentComponents = navFormUtils.findDependentComponents(original.id, this.form);
    if (dependentComponents.length > 0) {
      confirmationMessage = "En eller flere andre komponenter har avhengighet til denne. Vil du fremdeles slette den?";
    }

    if (confirmationMessage && !window.confirm(this.t(confirmationMessage))) {
      return false;
    }
  }
  return originalRemoveComponent.call(this, component, parent, original);
}

WebformBuilder.prototype.editComponent = function (component, parent, isNew, isJsonEdit, original, flags = {}) {
  if (!component.key) {
    return;
  }
  if (original && original.id) {
    this.conditionalAlert = null;
    const dependentComponents = navFormUtils.findDependentComponents(original.id, this.form);
    if (dependentComponents.length > 0) {
      this.conditionalAlert = {
        message: "Følgende komponenter har avhengighet til denne:",
        components: dependentComponents,
      }
    }
  }
  originalEditComponent.call(this, component, parent, isNew, isJsonEdit, original, flags);
}

WebformBuilder.prototype.destroy = function (...args) {
  this.conditionalAlert = null;
  if (this.dialog) {
    this.dialog.close();
  }
  originalDestroy.call(this, ...args);
}
