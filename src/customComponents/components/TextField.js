import TextField from "formiojs/components/textfield/TextField";
import TextFieldEditForm from "formiojs/components/textfield/TextField.form";
import TextFieldDisplayEditForm from "formiojs/components/textfield/editForm/TextField.edit.display";
import { fieldSizeField } from "./fields/fieldSize";
import { descriptionPositionField } from "./fields/descriptionPositionField";

TextField.editForm = () => {
  return TextFieldEditForm([
    {
      label: "Display",
      key: "display",
      components: [...TextFieldDisplayEditForm, fieldSizeField, descriptionPositionField],
    },
  ]);
};

export default TextField;
