import Alert from './Alert';

const alertBuilder = () => {
  const schema = Alert.schema();
  return {
    title: 'Alertstripe',
    schema: {
      ...schema,
    },
  };
};

export default alertBuilder;
