import MonthPicker from './MonthPicker';

const monthPickerBuilder = () => {
  const schema = MonthPicker.schema();
  return {
    title: 'Månedsvelger',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default monthPickerBuilder;
