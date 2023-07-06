import { Builders, Components, Formio, Utils } from "formiojs";
import CustomComponents from "./customComponents";
import Template from "./template";

const FormioJS = {
  Components,
  Formio,
  Builders,
  Utils,
};

FormioJS.Components.setComponents(CustomComponents);
FormioJS.Formio.use(Template);

export default FormioJS;
