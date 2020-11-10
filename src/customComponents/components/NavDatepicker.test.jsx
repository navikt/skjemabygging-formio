import NavDatepicker from "./NavDatepicker";

const expectedEditForm = {
  components: [
    {
      components: [
        {
          components: [
            {
              defaultValue: true,
              input: true,
              key: "visArvelger",
              label: "Vis årvelger i kalender",
              type: "checkbox",
            },
            {
              input: true,
              key: "label",
              label: "Label",
              placeholder: "Field Label",
              tooltip: "The label for this field that will appear next to it.",
              type: "textfield",
              validate: {
                required: true,
              },
              weight: 0,
            },
            {
              data: {
                values: [
                  {
                    label: "Top",
                    value: "top",
                  },
                  {
                    label: "Left (Left-aligned)",
                    value: "left-left",
                  },
                  {
                    label: "Left (Right-aligned)",
                    value: "left-right",
                  },
                  {
                    label: "Right (Left-aligned)",
                    value: "right-left",
                  },
                  {
                    label: "Right (Right-aligned)",
                    value: "right-right",
                  },
                  {
                    label: "Bottom",
                    value: "bottom",
                  },
                ],
              },
              dataSrc: "values",
              defaultValue: "top",
              input: true,
              key: "labelPosition",
              label: "Label Position",
              tooltip: "Position for the label for this field.",
              type: "select",
              weight: 20,
            },
            {
              clearOnHide: false,
              conditional: {
                json: {
                  and: [
                    {
                      "!==": [
                        {
                          var: "data.labelPosition",
                        },
                        "top",
                      ],
                    },
                    {
                      "!==": [
                        {
                          var: "data.labelPosition",
                        },
                        "bottom",
                      ],
                    },
                  ],
                },
              },
              input: true,
              key: "labelWidth",
              label: "Label Width",
              placeholder: "30",
              suffix: "%",
              tooltip: "The width of label on line in percentages.",
              type: "number",
              validate: {
                max: 100,
                min: 0,
              },
              weight: 30,
            },
            {
              clearOnHide: false,
              conditional: {
                json: {
                  and: [
                    {
                      "!==": [
                        {
                          var: "data.labelPosition",
                        },
                        "top",
                      ],
                    },
                    {
                      "!==": [
                        {
                          var: "data.labelPosition",
                        },
                        "bottom",
                      ],
                    },
                  ],
                },
              },
              input: true,
              key: "labelMargin",
              label: "Label Margin",
              placeholder: "3",
              suffix: "%",
              tooltip: "The width of label margin on line in percentages.",
              type: "number",
              validate: {
                max: 100,
                min: 0,
              },
              weight: 30,
            },
            {
              as: "html",
              editor: "ace",
              input: true,
              key: "description",
              label: "Description",
              placeholder: "Description for this field.",
              tooltip: "The description is text that will appear below the input field.",
              type: "textarea",
              weight: 200,
              wysiwyg: {
                minLines: 3,
              },
            },
            {
              as: "html",
              editor: "ace",
              input: true,
              key: "tooltip",
              label: "Tooltip",
              placeholder: "To add a tooltip to this field, enter text here.",
              tooltip: "Adds a tooltip to the side of this field.",
              type: "textarea",
              weight: 300,
              wysiwyg: {
                minLines: 3,
              },
            },
            {
              input: true,
              key: "customClass",
              label: "Custom CSS Class",
              placeholder: "Custom CSS Class",
              tooltip: "Custom CSS class to add to this component.",
              type: "textfield",
              weight: 500,
            },
            {
              input: true,
              key: "tabindex",
              label: "Tab Index",
              placeholder: "0",
              tooltip:
                "Sets the tabindex attribute of this component to override the tab order of the form. See the <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex'>MDN documentation</a> on tabindex for more information.",
              type: "textfield",
              weight: 600,
            },
            {
              input: true,
              key: "hideLabel",
              label: "Hide Label",
              tooltip:
                "Hide the label of this component. This allows you to show the label in the form builder, but not when it is rendered.",
              type: "checkbox",
              weight: 1200,
            },
            {
              input: true,
              key: "autofocus",
              label: "Initial Focus",
              tooltip: "Make this field the initially focused element on this form.",
              type: "checkbox",
              weight: 1350,
            },
            {
              customConditional: expect.anything(),
              input: true,
              key: "dataGridLabel",
              label: "Show Label in DataGrid",
              tooltip: "Show the label when in a Datagrid.",
              type: "checkbox",
              weight: 1370,
            },
            {
              input: true,
              key: "tableView",
              label: "Table View",
              tooltip: "Shows this value within the table view of the submissions.",
              type: "checkbox",
              weight: 1500,
            },
            {
              input: true,
              key: "modalEdit",
              label: "Modal Edit",
              tooltip: "Opens up a modal to edit the value of this component.",
              type: "checkbox",
              weight: 1600,
            },
          ],
          key: "display",
          label: "Visning",
          weight: 0,
        },
        {
          components: [
            {
              input: true,
              key: "validate.required",
              label: "Required",
              tooltip: "A required field must be filled in before the form can be submitted.",
              type: "checkbox",
              weight: 10,
            },
            {
              input: true,
              key: "unique",
              label: "Unique",
              tooltip: "Makes sure the data submitted for this field is unique, and has not been submitted before.",
              type: "checkbox",
              weight: 100,
            },
            {
              data: {
                values: [
                  {
                    label: "Change",
                    value: "change",
                  },
                  {
                    label: "Blur",
                    value: "blur",
                  },
                ],
              },
              dataSrc: "values",
              defaultValue: "change",
              input: true,
              key: "validateOn",
              label: "Validate On",
              tooltip: "Determines when this component should trigger front-end validation.",
              type: "select",
              weight: 0,
            },
            {
              input: true,
              key: "errorLabel",
              label: "Error Label",
              placeholder: "Error Label",
              tooltip: "The label for this field when an error occurs.",
              type: "textfield",
              weight: 190,
            },
            {
              input: true,
              key: "validate.customMessage",
              label: "Custom Error Message",
              placeholder: "Custom Error Message",
              tooltip: "Error message displayed if any error occurred.",
              type: "textfield",
              weight: 200,
            },
            {
              collapsed: true,
              collapsible: true,
              components: [
                {
                  content:
                    '<p>The following variables are available in all scripts.</p><table class="table table-bordered table-condensed table-striped"><tr><th>input</th><td>The value that was input into this component</td></tr><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual "row" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href="https://lodash.com/docs/" target="_blank">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href="http://formio.github.io/formio.js/docs/identifiers.html#utils" target="_blank">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for "utils".</td></tr></table><br/>',
                  tag: "div",
                  type: "htmlelement",
                },
                {
                  editor: "ace",
                  hideLabel: true,
                  input: true,
                  key: "validate.custom",
                  rows: 5,
                  type: "textarea",
                },
                {
                  content:
                    "\n          <small>\n            <p>Enter custom validation code.</p>\n            <p>You must assign the <strong>valid</strong> variable as either <strong>true</strong> or an error message if validation fails.</p>\n            <h5>Example:</h5>\n            <pre>valid = (input === 'Joe') ? true : 'Your name must be \"Joe\"';</pre>\n          </small>",
                  tag: "div",
                  type: "htmlelement",
                },
                {
                  components: [
                    {
                      description:
                        "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.",
                      input: true,
                      key: "validate.customPrivate",
                      label: "Secret Validation",
                      tooltip:
                        "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.",
                      type: "checkbox",
                      weight: 100,
                    },
                  ],
                  type: "well",
                },
              ],
              customConditional: expect.anything(),
              key: "custom-validation-js",
              style: {
                "margin-bottom": "10px",
              },
              title: "Custom Validation",
              type: "panel",
              weight: 300,
            },
            {
              collapsed: true,
              collapsible: true,
              components: [
                {
                  content:
                    '<p>Execute custom logic using <a href="http://jsonlogic.com/" target="_blank">JSONLogic</a>.</p><h5>Example:</h5><pre>{\n  "if": [\n    {\n      "===": [\n        {\n          "var": "input"\n        },\n        "Bob"\n      ]\n    },\n    true,\n    "Your name must be \'Bob\'!"\n  ]\n}</pre>',
                  tag: "div",
                  type: "htmlelement",
                },
                {
                  as: "json",
                  editor: "ace",
                  hideLabel: true,
                  input: true,
                  key: "validate.json",
                  rows: 5,
                  type: "textarea",
                },
              ],
              key: "json-validation-json",
              title: "JSONLogic Validation",
              type: "panel",
              weight: 400,
            },
          ],
          key: "validation",
          label: "Validering",
          weight: 20,
        },
        {
          components: [
            {
              components: [
                {
                  data: {
                    values: [
                      {
                        label: "True",
                        value: "true",
                      },
                      {
                        label: "False",
                        value: "false",
                      },
                    ],
                  },
                  dataSrc: "values",
                  input: true,
                  key: "conditional.show",
                  label: "This component should Display:",
                  type: "select",
                },
                {
                  data: {
                    custom: expect.anything(),
                  },
                  dataSrc: "custom",
                  input: true,
                  key: "conditional.when",
                  label: "When the form component:",
                  type: "select",
                  valueProperty: "value",
                },
                {
                  input: true,
                  key: "conditional.eq",
                  label: "Has the value:",
                  type: "textfield",
                },
              ],
              key: "simple-conditional",
              theme: "default",
              title: "Simple",
              type: "panel",
            },
            {
              collapsed: true,
              collapsible: true,
              components: [
                {
                  content:
                    '<p>The following variables are available in all scripts.</p><table class="table table-bordered table-condensed table-striped"><tr><th>form</th><td>The complete form JSON object</td></tr><tr><th>submission</th><td>The complete submission object.</td></tr><tr><th>data</th><td>The complete submission data object.</td></tr><tr><th>row</th><td>Contextual "row" data, used within DataGrid, EditGrid, and Container components</td></tr><tr><th>component</th><td>The current component JSON</td></tr><tr><th>instance</th><td>The current component instance.</td></tr><tr><th>value</th><td>The current value of the component.</td></tr><tr><th>moment</th><td>The moment.js library for date manipulation.</td></tr><tr><th>_</th><td>An instance of <a href="https://lodash.com/docs/" target="_blank">Lodash</a>.</td></tr><tr><th>utils</th><td>An instance of the <a href="http://formio.github.io/formio.js/docs/identifiers.html#utils" target="_blank">FormioUtils</a> object.</td></tr><tr><th>util</th><td>An alias for "utils".</td></tr></table><br/>',
                  tag: "div",
                  type: "htmlelement",
                },
                {
                  collapsed: false,
                  collapsible: true,
                  components: [
                    {
                      editor: "ace",
                      hideLabel: true,
                      input: true,
                      key: "customConditional",
                      rows: 5,
                      type: "textarea",
                    },
                    {
                      content:
                        "<p>Enter custom javascript code.</p><p>You must assign the <strong>show</strong> variable a boolean result.</p><p><strong>Note: Advanced Conditional logic will override the results of the Simple Conditional logic.</strong></p><h5>Example</h5><pre>show = !!data.showMe;</pre>",
                      tag: "div",
                      type: "htmlelement",
                    },
                  ],
                  customConditional: expect.anything(),
                  key: "customConditional-js",
                  style: {
                    "margin-bottom": "10px",
                  },
                  title: "JavaScript",
                  type: "panel",
                },
                {
                  collapsed: true,
                  collapsible: true,
                  components: [
                    {
                      content:
                        '<p>Execute custom logic using <a href="http://jsonlogic.com/" target="_blank">JSONLogic</a>.</p><p>Full <a href="https://lodash.com/docs" target="_blank">Lodash</a> support is provided using an "_" before each operation, such as <code>{"_sum": {var: "data.a"}}</code></p><p><a href="http://formio.github.io/formio.js/app/examples/conditions.html" target="_blank">Click here for an example</a></p>',
                      tag: "div",
                      type: "htmlelement",
                    },
                    {
                      as: "json",
                      editor: "ace",
                      hideLabel: true,
                      input: true,
                      key: "conditional.json",
                      rows: 5,
                      type: "textarea",
                    },
                  ],
                  key: "customConditional-json",
                  title: "JSONLogic",
                  type: "panel",
                },
              ],
              key: "customConditionalPanel",
              theme: "default",
              title: "Advanced Conditions",
              type: "panel",
              weight: 110,
            },
          ],
          key: "conditional",
          label: "Conditional",
          weight: 40,
        },
        {
          components: [
            {
              input: true,
              key: "key",
              label: "Property Name",
              tooltip: "The name of this field in the API endpoint.",
              type: "textfield",
              validate: {
                pattern: "(\\w|\\w[\\w-.]*\\w)",
                patternMessage:
                  "The property name must only contain alphanumeric characters, underscores, dots and dashes and should not be ended by dash or dot.",
              },
              weight: 0,
            },
            {
              input: true,
              key: "tags",
              label: "Field Tags",
              storeas: "array",
              tooltip: "Tag the field for use in custom logic.",
              type: "tags",
              weight: 100,
            },
            {
              key: "properties",
              label: "Custom Properties",
              tooltip: "This allows you to configure any custom properties for this component.",
              type: "datamap",
              valueComponent: {
                input: true,
                key: "value",
                label: "Value",
                placeholder: "Value",
                type: "textfield",
              },
              weight: 200,
            },
          ],
          key: "api",
          label: "API",
          weight: 60,
        },
      ],
      key: "tabs",
      type: "tabs",
    },
  ],
  key: "type",
  type: "hidden",
};

it("should generate the correct datastructure", () => {
  const editForm = NavDatepicker.editForm();
  expect(editForm).toEqual(expectedEditForm);
});
