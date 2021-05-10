import TextArea from "formiojs/components/textarea/TextArea";
import TextAreaEditForm from "formiojs/components/textarea/TextArea.form";
import TextAreaDisplayEditForm from "formiojs/components/textarea/editForm/TextArea.edit.display";
import { descriptionPositionField } from "./fields/descriptionPositionField";

TextArea.editForm = () => {
  return TextAreaEditForm([
    {
      label: "Display",
      key: "display",
      components: [...TextAreaDisplayEditForm, descriptionPositionField],
    },
  ]);
};

export default TextArea;
