const organisasjonPalett = {
  title: "Bedrift / organisasjon",
  components: {
    orgNr: {
      title: "Org.nr.",
      key: "orgNr",
      icon: "institution",
      schema: {
        label: "Organisasjonsnummer",
        type: "orgNr",
        key: "orgNr",
        fieldSize: "input--s",
        input: true,
        spellcheck: false,
        dataGridLabel: true,
        clearOnHide: true,
        validateOn: "blur",
        delimiter: true,
        truncateMultipleSpaces: false,
        requireDecimal: false,
        maxLength: 9,
        displayMask: "999 999 999",
        inputMaskPlaceholderChar: " ", // U+00a0 -space
        validate: {
          required: true,
          custom: "valid = instance.validateOrganizationNumber(input)",
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
