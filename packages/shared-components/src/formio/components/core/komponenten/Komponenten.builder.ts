import Komponenten from './Komponenten';

const komponentenBuilder = () => {
  const schema = Komponenten.schema();
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

export default komponentenBuilder;
