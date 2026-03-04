import Recipient from './Recipient';

const recipientBuilder = () => {
  const schema = Recipient.schema();

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

export default recipientBuilder;
