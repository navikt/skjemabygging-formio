const organisasjonPalett = {
  title: "Bedrift / organisasjon",
  components: {
    orgNr: {
      title: "Org.nr.",
      key: "orgNr",
      icon: "institution",
      schema: {
        label: "Organisasjonsnummer",
        type: "textfield",
        key: "orgNr",
        fieldSize: "input--s",
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        validateOn: "blur",
        clearOnHide: true,
        validate: {
          required: true,
          maxLength: 9,
          minLength: 9,
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