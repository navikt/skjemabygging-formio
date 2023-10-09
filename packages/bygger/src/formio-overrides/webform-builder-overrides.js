import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';

const WebformBuilder = NavFormioJs.Builders.builders.webform;
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
      confirmationMessage = 'En eller flere andre komponenter har avhengighet til denne. Vil du fremdeles slette den?';
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
  if (original && original.id) {
    this.conditionalAlert = null;
    const dependentComponents = navFormUtils.findDependentComponents(original.id, this.form);
    if (dependentComponents.length > 0) {
      this.conditionalAlert = {
        message: 'Følgende komponenter har avhengighet til denne:',
        components: dependentComponents,
      };
    }
  }
  if (original && original.key && this.options.formConfig) {
    this.navFormDiff = null;
    const { publishedForm } = this.options.formConfig;
    if (publishedForm) {
      const diff = formDiffingTool.getComponentDiff(original, publishedForm);
      if (diff.changesToCurrentComponent.length || diff.deletedComponents.length) {
        this.navFormDiff = diff;
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
