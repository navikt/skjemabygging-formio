import Component from "formiojs/components/_classes/component/Component";
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
    return {
      components: [
        {
          type: "tabs",
          key: "tabs",
          components: [
            {
              label: "Display",
              key: "display",
              components: [
                {
                  type: "file",
                  fileMaxSize: "5MB",
                  label: "Last opp fil",
                  key: "image",
                  storage: "base64",
                  image: true,
                  filePattern: ".png, .jpg, .jpeg",
                  webcam: false,
                  input: true,
                  multiple: false,
                },
                {
                  type: "textfield",
                  label: "Alt Text",
                  key: "altText",
                  weight: 2,
                  input: true,
                  validate: {
                    required: true,
                  },
                },
                {
                  type: "textfield",
                  label: "Bilde Beskrivelse",
                  key: "description",
                  weight: 2,
                  input: true,
                  validate: {
                    required: true,
                  },
                },
                {
                  label: "Bilde Størrelse",
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
              ],
            },
          ],
        },
      ],
    };
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
