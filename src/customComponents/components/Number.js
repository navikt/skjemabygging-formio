import Number from "formiojs/components/number/Number";
import NumberEditForm from "formiojs/components/number/Number.form";
import NumberDisplayEditForm from "formiojs/components/number/editForm/Number.edit.display";

Number.editForm = () => {
  return NumberEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...NumberDisplayEditForm,
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

export default Number;
