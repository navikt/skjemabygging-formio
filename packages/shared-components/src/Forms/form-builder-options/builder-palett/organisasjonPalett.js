const organisasjonPalett = {
  title: "Bedrift / organisasjon",
  components: {
    orgNr: {
      title: "Org.nr.",
      key: "orgNr",
      icon: "institution",
      schema: {
        label: "Organisasjonsnummer",
        type: "number",
        key: "orgNr",
        fieldSize: "input--s",
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        validateOn: "blur",
        clearOnHide: true,
        delimiter: true,
        truncateMultipleSpaces: false,
        requireDecimal: false,
        validate: {
          required: true,
          max: 999999999,
          min: 111111111,
          customMessage: "Organisasjonsnummeret må inneholde 9 siffer",
        },
      },
    },
    Arbeidsgiver: {
      title: "Arbeidsgiver",
      key: "arbeidsgiver",
      icon: "institution",
      schema: {
        label: "Arbeidsgiver",
        type: "textfield",
        key: "arbeidsgiver",
        fieldSize: "input--xxl",
        input: true,
        dataGridLabel: true,
        validateOn: "blur",
        clearOnHide: true,
        validate: {
          required: true,
        },
      },
    },
  },
};

export default organisasjonPalett;
