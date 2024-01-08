import Alert from './Alert';

const alertBuilder = () => {
  const schema = Alert.schema();
  return {
    title: 'Alertstripe',
    group: 'layout',
    schema: {
      ...schema,
    },
  };
};

export default alertBuilder;
