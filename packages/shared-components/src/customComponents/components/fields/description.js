export const description = [
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
    weight: 200,
  },
  {
    type: "checkbox",
    input: true,
    label: "Utvidet beskrivelse",
    key: "additionalDescription",
    defaultValue: false,
    weight: 201,
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
    },
    weight: 202,
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
    },
    weight: 203,
  },
];