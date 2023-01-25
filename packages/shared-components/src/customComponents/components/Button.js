import Button from "formiojs/components/button/Button";
import ButtonEditForm from "formiojs/components/button/Button.form";
import ButtonDisplayEditForm from "formiojs/components/button/editForm/Button.edit.display";
import FormBuilderOptions from "../../Forms/form-builder-options";

export default class NavButton extends Button {
  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.button;
  }

  static schema(...extend) {
    return Button.schema({
      ...FormBuilderOptions.builder.basic.components.button.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return ButtonEditForm([
      {
        label: "Display",
        key: "display",
        components: [
          {
            type: "textfield",
            label: "Text",
            key: "buttonText",
            weight: 1,
            input: true,
            validate: {
              required: true,
            },
          },
          {
            key: "theme",
            ignore: true,
          },
          {
            key: "size",
            ignore: true,
          },
          {
            key: "rightIcon",
            ignore: true,
          },
          {
            key: "leftIcon",
            ignore: true,
          },
          {
            key: "shortcut",
            ignore: true,
          },
          {
            key: "label",
            ignore: true,
          },
          {
            key: "labelPosition",
            ignore: true,
          },
          {
            key: "placeholder",
            ignore: true,
          },
          {
            key: "tooltip",
            ignore: true,
          },
          {
            key: "tabindex",
            ignore: true,
          },
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "hideLabel",
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
          ...ButtonDisplayEditForm,
        ],
      },
      {
        key: "api",
        components: [
          { key: "tags", ignore: true },
          { key: "properties", ignore: true },
        ],
      },
      {
        key: "addons",
        ignore: true,
      },
      {
        key: "logic",
        ignore: true,
      },
      {
        key: "layout",
        ignore: true,
      },
      {
        key: "validation",
        ignore: true,
      },
      {
        key: "data",
        ignore: true,
      },
      ...extend,
    ]);
  }
}
