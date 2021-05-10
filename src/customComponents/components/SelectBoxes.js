import SelectBoxes from "formiojs/components/selectboxes/SelectBoxes";
import SelectBoxesEditForm from "formiojs/components/selectboxes/SelectBoxes.form";
import { descriptionPositionField } from "./fields/descriptionPositionField";

SelectBoxes.editForm = () => {
  return SelectBoxesEditForm([
    {
      label: "Display",
      key: "display",
      components: [descriptionPositionField],
    },
  ]);
};

export default SelectBoxes;
