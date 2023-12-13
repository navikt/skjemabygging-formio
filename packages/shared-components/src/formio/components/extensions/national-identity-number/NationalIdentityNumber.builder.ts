import { defaultBuilderSchema } from '../../base/builderHelper';
import NationalIdentityNumber from './NationalIdentityNumber';

const nationalIdentityNumberBuilder = () => {
  const schema = NationalIdentityNumber.schema();
  return {
    title: 'Fødselsnummer',
    group: 'person',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
      validate: {
        ...defaultBuilderSchema().validate,
        custom: 'valid = instance.validateFnrNew(input)',
      },
    },
  };
};

export default nationalIdentityNumberBuilder;
