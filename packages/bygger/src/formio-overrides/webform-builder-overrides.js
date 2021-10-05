import * as formiojs from "formiojs";

const WebformBuilder = formiojs.Builders.builders.webform;
const originalRemoveComponent = WebformBuilder.prototype.removeComponent;

WebformBuilder.prototype.removeComponent = function (component, parent, original) {
  if (!parent) {
    return;
  }
  const confirmationMessage = this.options.getRemovalConfirmationMessage &&
    this.options.getRemovalConfirmationMessage(component, parent, original);

  if (confirmationMessage && !window.confirm(this.t(confirmationMessage))) {
    return false;
  }
  return originalRemoveComponent.call(this, component, parent, original);
}
