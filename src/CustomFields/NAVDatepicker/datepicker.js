import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Datovelger } from 'nav-datovelger';
import validationEditForm from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import displayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display"
import ReactComponent from "../ReactComponent";

const AvansertDatovelger = ({component, onChange, value}) => {
  const [dato, setDato] = useState(value || '');
  //Ref. toggle - må man virkelig ha både internal og external state her??
  //Gjorde et kjapt forsøk på å bytte til value og onChange alene - det fungerte ikke.

  console.log(component);
  return (
    <Datovelger
      id={component.id}
      valgtDato={dato}
      onChange={(d) => {
        setDato(d)
        onChange(d)
      }}
      kalender={{ visUkenumre: component.visUkenumre }}
      visÅrVelger={component.visArvelger}
      locale={'nb'} //hva gjør vi med denne?
    />
  );
}


export default class Datepicker extends ReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: "DatoSissel",
      group: 'advanced',
      icon: 'square',
      schema: Datepicker.schema()
    };
  }

  static schema(...extend) {
    return ReactComponent.schema({
      type: "navDatepicker",
      label: "Dato",
      "validateOn": "blur",
      "validate": {
        "required": true,
      },
      "input": true
    }, ...extend);
  }

  /*
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm() {
    console.log(displayEditForm);
    return {
      type: "hidden",
      key: "type",
      components: [{
        type: 'tabs',
        key: 'tabs',
        components: [{
          label: 'Visning',
          key: 'display',
          weight: 0,
          components: [
            {
              type: 'checkbox',
              label: 'Vis ukenumre i kalender',
              key: 'visUkenumre',
              defaultValue: true,
              input: true
            },
            {
              type: 'checkbox',
              label: 'Vis årvelger i kalender',
              key: 'visArvelger',
              defaultValue: true,
              input: true
            },
            ...displayEditForm
          ]
        },
          {
            label: 'Validering',
            key: 'validation',
            weight: 20,
            components: validationEditForm
          }]
      }]
    }
  }
        /*
    return baseEditForm(
      [
        {
          key: "display",
          components: [
            {
              weight: 1,
              type: 'checkbox',
              label: 'Vis ukenumre i kalender',
              key: 'visUkenumre',
              defaultValue: true,
              input: true
            },
            {
              weight: 2,
              type: 'checkbox',
              label: 'Vis årvelger i kalender',
              key: 'visArvelger',
              defaultValue: true,
              input: true
            }
          ]
        },
        {
          key: "data",
          ignore: true,
          components: [
             skal vi ha dette?
            {
              key: "customDefaultValue",
              type: "textfield",
              input: true,
              weight: 1,
              label: "Predefinert dato (eks. 2020-04-10)"
            },

            {
              key: "defaultValue",
              ignore: true
            }
          ]
        },
        {
          key: "validation",
          ignore: true
        },
        {
          key: "api",
          ignore: true
        },
        {
          key: "logic",
          ignore: true
        },
        {
          key: "layout",
          ignore: true
        }
      ],

         */

  attachReact(element) {
    return ReactDOM.render(
      <AvansertDatovelger
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
      />,
      element
    );
  }

  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }
}
