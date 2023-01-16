import { formDiffingTool, navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { Builders } from "formiojs";
import featureToggles from "../featureToggles";

const WebformBuilder = Builders.builders.webform;
const originalRemoveComponent = WebformBuilder.prototype.removeComponent;
const originalEditComponent = WebformBuilder.prototype.editComponent;
const originalDestroy = WebformBuilder.prototype.destroy;

WebformBuilder.prototype.removeComponent = function (component, parent, original) {
  if (!parent) {
    return;
  }
  if (featureToggles.enableConditionalAlert && original && original.id) {
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
};

WebformBuilder.prototype.editComponent = function (component, parent, isNew, isJsonEdit, original, flags = {}) {
  if (!component.key) {
    return;
  }
  if (featureToggles.enableConditionalAlert && original && original.id) {
    this.conditionalAlert = null;
    const dependentComponents = navFormUtils.findDependentComponents(original.id, this.form);
    if (dependentComponents.length > 0) {
      this.conditionalAlert = {
        message: "Følgende komponenter har avhengighet til denne:",
        components: dependentComponents,
      };
    }
  }
  if (original && original.key) {
    this.navFormDiff = null;
    const { publishedForm } = this.options.formConfig;
    if (publishedForm) {
      const changes = formDiffingTool.checkComponentDiff(original, publishedForm);
      console.log("override diff", JSON.stringify(changes));
      if (original.type === "panel" && changes && changes.components) {
        const deletedComponents = navFormUtils
          .flattenComponents(changes.components)
          .filter((compDiff) => compDiff.status === "Slettet");
        console.log("delete", deletedComponents);
        this.navFormDiff = {
          message: "Slettede elementer",
          data: changes,
        };
      } else if (changes && changes.status === "Endring") {
        // const {diff} = changes;
        this.navFormDiff = {
          message: "Endrede elementer",
          data: changes,
        };
      }
    }
  }
  originalEditComponent.call(this, component, parent, isNew, isJsonEdit, original, flags);
};

WebformBuilder.prototype.destroy = function (...args) {
  this.conditionalAlert = null;
  this.navFormDiff = null;
  if (this.dialog) {
    this.dialog.close();
  }
  originalDestroy.call(this, ...args);
};
