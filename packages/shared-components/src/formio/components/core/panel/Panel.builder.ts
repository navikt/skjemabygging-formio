import Panel from './Panel';

const panelBuilder = () => {
  const schema = Panel.schema();
  return {
    title: 'Tomt panel',
    schema,
  };
};

export default panelBuilder;
