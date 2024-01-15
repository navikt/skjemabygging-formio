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
          type: 'radiopanel',
          key: 'annenDokumentasjon',
          otherDocumentation: true,
          input: true,
          clearOnHide: true,
          validate: {
            required: true,
          },
          properties: {
            vedleggstittel: 'Annet',
            vedleggskode: 'N6',
          },
          values: [
            {
              value: 'nei',
              label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.',
            },
            {
              value: 'leggerVedNaa',
              label: 'Ja, jeg legger det ved denne søknaden.',
            },
            {
              value: 'ettersender',
              label: 'Jeg ettersender dokumentasjonen senere.',
            },
          ],
        },
      ],
    },
  };
};

export default attachmentBuilder;
