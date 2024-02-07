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
    },
  };
};

export default attachmentBuilder;
