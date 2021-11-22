const fodselsNummerDNummerSchema = (keyPostfix = "") => ({
  label: "Fødselsnummer / D-nummer",
  type: "fnrfield",
  key: `fodselsnummerDNummer${keyPostfix}`,
  fieldSize: "input--s",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.validateFnr(input) === 'true'? true: instance.validateFnr(input);",
    required: true,
  },
});

export default fodselsNummerDNummerSchema;
