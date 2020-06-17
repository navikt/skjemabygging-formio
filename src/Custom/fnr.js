import components from 'formiojs/components';
import baseEditForm from "formiojs/components/_classes/component/Component.form";

const TextFieldComponent = components.textfield;


export class Fnr extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema({
      type: 'fnrfield',
      "label": "Fødselsnummer",
      "inputMask": "999999 99999",
      "validateOn": "blur",
      "validate": {
        "required": true,
        "pattern": "",
        "customMessage": "11 siffer",
      },
      "input": true
    }, ...extend);
  }

  get defaultSchema() {
    return Fnr.schema();
  }

  static get builderInfo() {
    return {
      title: 'Fødselsnummer',
      group: 'advanced',
      icon: 'fa fa-terminal',
      // weight: 70,
      // documentation: 'http://help.form.io/userguide/#table',
      schema: Fnr.schema()
    }
  }

  static editForm(...extend) {
    return baseEditForm(
      [
        {
          key: "display",
          components: [
            {
              // You can ignore existing fields.
              key: "placeholder",
              ignore: true
            },
            {
              // Or add your own. The syntax is form.io component definitions.
              type: "textfield",
              input: true,
              label: "My Custom Setting",
              weight: 12,
              key: "myCustomSetting" // This will be available as component.myCustomSetting
            }
          ]
        },
        {
          key: "data",
          ignore: true,
          components: false
        },
        {
          key: "validation",
          ignore: true,
          components: false
        },
        {
          key: "api",
          components: []
        },
        {
          key: "conditional",
          components: []
        },
        {
          key: "logic",
          components: []
        }
      ],
      ...extend
    );
  }
}