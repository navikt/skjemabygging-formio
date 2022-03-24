import TextField from "../customComponents/components/TextField";

const originalRenderTemplate = TextField.prototype.renderTemplate;

const overrideFormioTextField = (enableAutoComplete = false) => {
  TextField.prototype.renderTemplate = function (name, data, editMode) {
    return originalRenderTemplate.call(this, name, { ...data, enableAutoComplete }, editMode);
  };
};

export { overrideFormioTextField };
