const attachmentBuilder = () => {
  return {
    title: 'Vedlegg',
    schema: {
      title: 'Vedlegg',
      type: 'panel',
      key: 'vedlegg',
      input: false,
      theme: 'default',
      isAttachmentPanel: true,
      components: [
        {
          label: 'Annen dokumentasjon',
          description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
          type: 'attachment',
          key: 'annenDokumentasjon',
          validate: {
            required: true,
          },
          attachmentType: 'other',
          properties: {
            vedleggstittel: 'Annet',
            vedleggskode: 'N6',
          },
          attachmentValues: {
            leggerVedNaa: {
              enabled: true,
            },
            ettersender: {
              additionalDocumentation: {
                enabled: false,
              },
              enabled: true,
              showDeadline: false,
            },
            nei: {
              enabled: true,
            },
          },
        },
      ],
    },
  };
};

export default attachmentBuilder;
