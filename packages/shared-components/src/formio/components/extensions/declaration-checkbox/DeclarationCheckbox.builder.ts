import DeclarationCheckbox from './DeclarationCheckbox';

const declarationCheckbox = () => {
  const schema = DeclarationCheckbox.schema();
  return {
    title: 'Standard erklæring',
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default declarationCheckbox;
