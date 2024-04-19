import OtherAttachment from './OtherAttachment';

const otherAttachmentBuilder = () => {
  const schema = OtherAttachment.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
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
        ettersender: {
          enabled: true,
        },
        levertTidligere: {
          enabled: true,
        },
      },
    },
  };
};

export default otherAttachmentBuilder;
