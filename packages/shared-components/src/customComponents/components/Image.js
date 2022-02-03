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
                  label: "Row title",
                  key: "rowTitle",
                  weight: 2,
                  input: true,
                },
              ],
            },
          ],
        },
      ],
    };
  }
  render() {
    return super.render(
      this.renderTemplate("image", {
        component: this.component,
      })
    );
  }
}
