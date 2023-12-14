import Datepicker from './Datepicker';

const datepickerBuilder = () => {
  const schema = Datepicker.schema();
  return {
    title: 'Datovelger',
    group: 'datoOgTid',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
      },
    },
  };
};

export default datepickerBuilder;
