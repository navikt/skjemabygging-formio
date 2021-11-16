const vedleggSchema = {
  title: "Vedlegg",
  type: "panel",
  input: false,
  key: "vedleggpanel",
  theme: "default",
  components: [
    {
      label: "Annen dokumentasjon",
      description: "Har du noen annen dokumentasjon du ønsker å legge ved?",
      type: "radiopanel",
      key: "annenDokumentasjon",
      input: true,
      clearOnHide: true,
      validate: {
        required: true,
      },
      properties: {
        vedleggstittel: "Annet",
        vedleggskode: "N6",
      },
      values: [
        {
          value: "leggerVedNaa",
          label: "Ja, jeg legger det ved denne søknaden.",
        },
        {
          value: "ettersender",
          label: "Jeg ettersender dokumentasjonen senere.",
        },
        {
          value: "nei",
          label: "Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.",
        },
      ],
    },
  ],
};

export default vedleggSchema;
