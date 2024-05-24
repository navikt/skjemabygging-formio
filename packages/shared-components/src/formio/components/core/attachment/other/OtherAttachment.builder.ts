const otherAttachmentBuilder = () => {
  const label = 'Annen dokumentasjon';
  return {
    title: label,
    schema: {
      label,
      description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
      type: 'attachment',
      key: 'annenDokumentasjon',
      dataSrc: 'values',
      validate: {
        required: true,
      },
      properties: {
        vedleggstittel: 'Annet',
        vedleggskode: 'N6',
      },
      attachmentType: 'other',
      attachmentValues: {
        leggerVedNaa: {
          enabled: true,
        },
        nei: {
          enabled: true,
        },
      },
    },
  };
};

export default otherAttachmentBuilder;
