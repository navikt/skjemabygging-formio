import ibanSchema from "../schemas/ibanSchema";

const pengerOgKontoPalett = {
  title: "Penger og konto",
  components: {
    currency: {
      title: "Beløp",
      key: "belop",
      icon: "dollar",
      schema: {
        label: "Beløp",
        type: "currency",
        key: "belop",
        fieldSize: "input--s",
        input: true,
        currency: "nok",
        spellcheck: false,
        dataGridLabel: true,
        clearOnHide: true,
        validateOn: "blur",
        validate: {
          required: true,
        },
      },
    },
    bankAccount: {
      title: "Kontonummer",
      key: "kontonummer",
      icon: "bank",
      schema: {
        label: "Kontonummer",
        type: "textfield",
        key: "kontoNummer",
        fieldSize: "input--s",
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        validateOn: "blur",
        clearOnHide: true,
        validate: {
          required: true,
          maxLength: 11,
          minLength: 11,
        },
      },
    },
    iban: {
      title: "IBAN",
      key: "iban",
      icon: "bank",
      schema: ibanSchema(),
    },
  },
};

export default pengerOgKontoPalett;
