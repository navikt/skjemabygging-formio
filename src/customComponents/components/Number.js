import Number from "formiojs/components/number/Number";
import NumberEditForm from "formiojs/components/number/Number.form";
import NumberDisplayEditForm from "formiojs/components/number/editForm/Number.edit.display";
import { fieldSizeField } from "./fields";

Number.editForm = () => {
  return NumberEditForm([
    {
      label: "Display",
      key: "display",
      components: [...NumberDisplayEditForm, fieldSizeField],
    },
  ]);
};

export default Number;
