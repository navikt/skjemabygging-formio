import HTMLElement from "formiojs/components/html/HTML";
import HTMLElementEditForm from "formiojs/components/html/HTML.form";
import HTMLElementDisplayEditForm from "formiojs/components/html/editForm/HTML.edit.display";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import FormioReactComponent from "../FormioReactComponent";

class AlertStripe extends HTMLElement {
  static get builderInfo() {
    return FormBuilderOptions.builder.layout.components.alertstripe;
  }

  static editForm(...extend) {
    return HTMLElementEditForm([
      {
        label: "Display",
        key: "display",
        components: [
          ...HTMLElementDisplayEditForm,
          {
            label: "Type",
            type: "radiopanel",
            key: "alerttype",
            input: true,
            weight: 81,
            values: [
              {
                value: "info",
                label: "Info",
              },
              {
                value: "suksess",
                label: "Suksess",
              },
              {
                value: "advarsel",
                label: "Advarsel",
              },
              {
                value: "feil",
                label: "Feil",
              },
            ],
          },
          {
            label: "Innhold som skal vises i pdf",
            type: "textfield",
            key: "contentForPdf",
            input: true,
          },
          {
            label: "Inline?",
            type: "navCheckbox",
            key: "isInline",
            input: true,
            weight: 82,
          },
          {
            key: "label",
            ignore: true,
          },
          {
            key: "className",
            ignore: true,
          },
          {
            key: "attrs",
            ignore: true,
          },
          {
            key: "tag",
            ignore: true,
          },
          {
            key: "refreshOnChange",
            ignore: true,
          },
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "hidden",
            ignore: true,
          },
          {
            key: "modalEdit",
            ignore: true,
          },
        ],
      },
      {
        key: "api",
        components: [
          {
            key: "properties",
            ignore: true,
          },
          {
            key: "tags",
            ignore: true,
          },
        ],
      },
      {
        key: "layout",
        ignore: true,
      },
      {
        key: "logic",
        ignore: true,
      },
      ...extend,
    ]);
  }

  static schema(...extend) {
    return FormioReactComponent.schema({
      ...FormBuilderOptions.builder.layout.components.alertstripe.schema,
      ...extend,
    });
  }
}

export default AlertStripe;
