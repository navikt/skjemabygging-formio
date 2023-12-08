import Datepicker from './Datepicker';

const datepickerBuilder = () => {
  return {
    title: 'Datovelger',
    group: 'datoOgTid',
    schema: Datepicker.schema(),
  };
};

export default datepickerBuilder;
