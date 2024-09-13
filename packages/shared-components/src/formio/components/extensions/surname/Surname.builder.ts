import Surname from './Surname';

const surnameBuilder = (keyPostfix = '') => {
  const schema = Surname.schema();

  return {
    title: schema.label,
    schema: {
      ...schema,
      key: `etternavn${keyPostfix}`,
      validate: {
        required: true,
      },
    },
  };
};

export default surnameBuilder;
