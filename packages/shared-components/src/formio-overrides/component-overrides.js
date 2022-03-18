import TextField from "../customComponents/components/TextField";

const originalRenderTemplate = TextField.prototype.renderTemplate;

const overrideFormioTextField = (enableAutoComplete) => {
  TextField.prototype.renderTemplate = function (name, data, editMode) {
    return originalRenderTemplate.call(this, name, { ...data, enableAutoComplete: enableAutoComplete }, editMode);
  };
};

export { overrideFormioTextField };
