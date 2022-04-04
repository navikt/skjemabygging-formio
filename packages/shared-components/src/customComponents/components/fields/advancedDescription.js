export const advancedDescription = [
  {
    type: "select",
    input: true,
    label: "Plassering av beskrivelse",
    key: "descriptionPosition",
    dataSrc: "values",
    data: {
      values: [
        { label: "Over label", value: "above" },
        { label: "Under label", value: "below" },
      ],
    },
    weight: 2,
  },
  {
    type: "checkbox",
    input: true,
    label: "Utvidet beskrivelse",
    key: "additionalDescription",
    defaultValue: false,
  },
  {
    type: "textfield",
    key: "additionalDescriptionLabel",
    label: "Lenketekst for utvidet beskrivelse",
    input: true,
    conditional: {
      show: true,
      when: "additionalDescription",
      eq: "true",
    },
    validate: {
      required: true,
      custom:
        "valid = data.additionalDescription && trim(data.additionalDescriptionLabel).length === 0  ? true : 'Lenketekst for utvidet beskrivelse må være satt';",
    },
  },
  {
    type: "textarea",
    key: "additionalDescriptionText",
    label: "Utvidet beskrivelse",
    editor: "ace",
    wysiwyg: {
      minLines: 3,
      isUseWorkerDisabled: true,
      mode: "ace/mode/html",
    },
    input: true,
    inputType: "text",
    inputFormat: "html",
    conditional: {
      show: true,
      when: "additionalDescription",
      eq: "true",
    },
    validate: {
      required: true,
      custom:
        "valid = data.additionalDescription && trim(data.additionalDescriptionLabel).length === 0  ? true : 'Utvidet beskrivelse må være satt';",
    },
  },
];
