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
      },
    },
  };
};

export default datePickerBuilder;
