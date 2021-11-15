import FormioRadio from "formiojs/components/radio/Radio";
import radioEditForm from "formiojs/components/radio/Radio.form";
import FormBuilderOptions from "../../Forms/form-builder-options";
import { descriptionPositionField } from "./fields/descriptionPositionField";

class Radio extends FormioRadio {
  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.radiopanel;
  }

  static schema(...extend) {
    return FormioRadio.schema({
      ...FormBuilderOptions.builder.basic.components.radiopanel.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return radioEditForm([
      ...extend,
      {
        label: "Display",
        key: "display",
        components: [
          descriptionPositionField,
          {
            key: "hideLabel",
            ignore: true,
          },
          {
            key: "labelPosition",
            ignore: true,
          },
          {
            key: "optionsLabelPosition",
            ignore: true,
          },
          {
            key: "tooltip",
            ignore: true,
          },
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "tabindex",
            ignore: true,
          },
          {
            key: "inline",
            ignore: true,
          },
          {
            key: "hidden",
            ignore: true,
          },
          {
            key: "autofocus",
            ignore: true,
          },
          {
            key: "disabled",
            ignore: true,
          },
          {
            key: "tableView",
            ignore: true,
          },
          {
            key: "modalEdit",
            ignore: true,
          },
        ],
      },
      {
        key: "data",
        components: [
          {
            key: "multiple",
            ignore: true,
          },
          {
            key: "persistent",
            ignore: true,
          },
          {
            key: "inputFormat",
            ignore: true,
          },
          {
            key: "protected",
            ignore: true,
          },
          {
            key: "dbIndex",
            ignore: true,
          },
          {
            key: "case",
            ignore: true,
          },
          {
            key: "encrypted",
            ignore: true,
          },
          {
            key: "redrawOn",
            ignore: true,
          },
          {
            key: "calculateServer",
            ignore: true,
          },
          {
            key: "allowCalculateOverride",
            ignore: true,
          },
          {
            key: "dataType",
            ignore: true,
          },
        ],
      },
      {
        key: "validation",
        components: [
          {
            key: "unique",
            ignore: true,
          },
        ],
      },
      {
        key: "logic",
        ignore: true,
        components: false,
      },
      {
        key: "layout",
        ignore: true,
        components: false,
      },
    ]);
  }
}

export default Radio;
