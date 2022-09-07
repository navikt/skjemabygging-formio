import Component from "formiojs/components/_classes/component/Component";
import ComponentEditForm from "formiojs/components/_classes/component/Component.form";
import ComponentDisplayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display";
import FormBuilderOptions from "../../Forms/form-builder-options";

export default class Image extends Component {
  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.image;
  }

  static schema(...extend) {
    return Component.schema({
      ...FormBuilderOptions.builder.basic.components.image.schema,
      ...extend,
    });
  }

  static editForm(...extend) {
    return ComponentEditForm([
      {
        label: "Display",
        key: "display",
        components: [
          {
            type: "file",
            fileMaxSize: "1MB",
            label: "Last opp fil",
            key: "image",
            storage: "base64",
            image: true,
            filePattern: ".png, .jpg, .jpeg",
            webcam: false,
            input: true,
            multiple: false,
            validate: {
              required: true,
            },
            weight: 0,
          },
          {
            type: "textfield",
            label: "Alt Text",
            key: "altText",
            weight: 1,
            input: true,
            validate: {
              required: true,
            },
          },
          {
            ...ComponentDisplayEditForm.find((component) => component.key === "description"),
            label: "Beskrivelse",
            validate: {
              required: true,
            },
            weight: 2,
          },
          {
            type: "navCheckbox",
            label: "Inkludere bilde i pdf?",
            key: "showInPdf",
            customDefaultValue: "value=true",
            input: true,
          },
          {
            label: "Størrelse",
            fieldSize: "input--xs",
            suffix: "%",
            delimiter: false,
            requireDecimal: false,
            truncateMultipleSpaces: false,
            validateOn: "blur",
            validate: {
              required: true,
              min: 20,
              max: 100,
            },
            defaultValue: 100,
            key: "widthPercent",
            type: "number",
            input: true,
            spellcheck: false,
            tableView: false,
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
          ...ComponentDisplayEditForm,
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
    ]);
  }

  handleWidth = (imgSize) => {
    if (imgSize > 100) {
      return "100%";
    }
    return imgSize + "%";
  };

  render() {
    return super.render(
      this.renderTemplate("image", {
        component: this.component,
      })
    );
  }
}
