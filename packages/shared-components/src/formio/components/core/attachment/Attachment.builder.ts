import Attachment from './Attachment';

const attachmentBuilder = () => {
  const schema = Attachment.schema();
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

export default attachmentBuilder;
