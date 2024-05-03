import Accordion from './Accordion';

const accordionBuilder = () => {
  const schema = Accordion.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
    },
  };
};

export default accordionBuilder;
