import DefaultAttachment from './DefaultAttachment';

const defaultAttachmentBuilder = () => {
  const schema = DefaultAttachment.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validate: {
        required: true,
      },
      attachmentType: 'default',
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

export default defaultAttachmentBuilder;
