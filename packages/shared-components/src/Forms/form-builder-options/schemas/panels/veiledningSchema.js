const veiledningSchema = {
  title: "Veiledning",
  type: "panel",
  input: false,
  key: "veiledning",
  theme: "default",
  components: [
    {
      label: "Beskrivelse",
      type: "htmlelement",
      key: "beskrivelsetekst",
      input: false,
      content: "Her skal det stå en kort beskrivelse av søknaden",
    },
    {
      label: "Veiledningstekst",
      type: "htmlelement",
      key: "veiledningstekst",
      input: false,
      content: "Her skal det stå en veiledningstekst for søknaden",
    },
  ],
};

export default veiledningSchema;
