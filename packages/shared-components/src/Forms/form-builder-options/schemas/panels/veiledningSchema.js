const veiledningSchema = {
  title: "Veiledning",
  type: "panel",
  input: false,
  key: "veiledning",
  theme: "default",
  components: [
    {
      label: "Veiledningstekst",
      type: "htmlelement",
      key: "veiledningstekst",
      input: false,
      content: "Her skal det stå litt informasjon om søknaden",
    },
  ],
};

export default veiledningSchema;