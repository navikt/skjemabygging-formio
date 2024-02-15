import Maalgruppe from './Maalgruppe';

const maalgruppeBuilder = () => {
  const schema = Maalgruppe.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      calculateValue: 'value = instance.calculateMaalgruppeValue()',
      prefillKey: 'sokerMaalgruppe',
    },
  };
};

export default maalgruppeBuilder;
