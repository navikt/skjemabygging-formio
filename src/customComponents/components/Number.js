import Number from "formiojs/components/number/Number";
import NumberEditForm from "formiojs/components/number/Number.form";
import NumberDisplayEditForm from "formiojs/components/number/editForm/Number.edit.display";
import { fieldSizeField } from "./fields/fieldSize";
import { descriptionPositionField } from "./fields/descriptionPositionField";

Number.editForm = () => {
  return NumberEditForm([
    {
      label: "Display",
      key: "display",
      components: [...NumberDisplayEditForm, fieldSizeField, descriptionPositionField],
    },
  ]);
};

export default Number;
