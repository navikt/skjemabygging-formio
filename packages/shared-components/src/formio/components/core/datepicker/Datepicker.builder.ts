import { defaultBuilderSchema } from '../../base/builderHelper';
import Datepicker from './Datepicker';

const datepickerBuilder = () => {
  const schema = Datepicker.schema();
  return {
    title: 'Datovelger',
    group: 'datoOgTid',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
      validate: {
        ...defaultBuilderSchema().validate,
        custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
      },
    },
  };
};

export default datepickerBuilder;
