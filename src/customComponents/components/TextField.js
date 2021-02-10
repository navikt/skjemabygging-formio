import TextField from "formiojs/components/textfield/TextField";
import TextFieldEditForm from "formiojs/components/textfield/TextField.form";
import TextFieldDisplayEditForm from "formiojs/components/textfield/editForm/TextField.edit.display";

TextField.editForm = () => {
  return TextFieldEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...TextFieldDisplayEditForm,
        {
          type: "select",
          input: true,
          label: "Feltstørrelse",
          key: "fieldSize",
          dataSrc: "values",
          data: {
            values: [
              { label: "Standard", value: "input--xxl" },
              { label: "XL", value: "input--xl" },
              { label: "L", value: "input--l" },
              { label: "M", value: "input--m" },
              { label: "S", value: "input--s" },
              { label: "XS", value: "input--xs" },
            ],
          },
          weight: 1,
        },
      ],
    },
  ]);
};

export default TextField;
