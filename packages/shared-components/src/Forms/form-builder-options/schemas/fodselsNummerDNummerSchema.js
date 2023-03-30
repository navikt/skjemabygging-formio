const fodselsNummerDNummerSchema = (keyPostfix = "") => ({
  label: "Fødselsnummer eller d-nummer",
  type: "fnrfield",
  key: `fodselsnummerDNummer${keyPostfix}`,
  fieldSize: "input--s",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.validateFnrNew(input)",
    required: true,
  },
});

export default fodselsNummerDNummerSchema;
