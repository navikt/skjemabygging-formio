export const description = [
  {
    type: 'select',
    label: 'Plassering av beskrivelse',
    key: 'descriptionPosition',
    dataSrc: 'values',
    data: {
      values: [
        { label: 'Over label', value: 'above' },
        { label: 'Under label', value: 'below' },
      ],
    },
    weight: 200,
  },
];
