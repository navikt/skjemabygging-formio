const attachmentBuilder = () => {
  return {
    title: 'Vedlegg',
    schema: {
      label: '< Navn på vedlegg > + husk å legge inn Gosys vedleggstittel og vedleggskode under API-fanen',
      type: 'radiopanel',
      key: 'vedleggNr',
      input: true,
      clearOnHide: true,
      properties: {
        vedleggstittel: '',
        vedleggskode: '',
      },
      values: [
        {
          value: 'leggerVedNaa',
          label: 'Jeg legger det ved denne søknaden (anbefalt)',
        },
        {
          value: 'ettersender',
          label:
            'Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
        },
        {
          value: 'levertTidligere',
          label: 'Jeg har levert denne dokumentasjonen tidligere',
        },
      ],
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default attachmentBuilder;
