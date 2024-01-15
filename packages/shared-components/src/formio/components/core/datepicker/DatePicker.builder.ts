import DatePicker from './DatePicker';

const datePickerBuilder = () => {
  const schema = DatePicker.schema();
  return {
    title: 'Datovelger',
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

export default datePickerBuilder;
