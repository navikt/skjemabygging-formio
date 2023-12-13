import { defaultBuilderSchema } from '../../base/builderHelper';
import AccountNumber from './AccountNumber';

const accountNumberBuilder = () => {
  const schema = AccountNumber.schema();
  return {
    title: schema.label,
    group: 'pengerOgKonto',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
      validate: {
        ...defaultBuilderSchema().validate,
        custom: 'valid = instance.validateAccountNumber(input)',
        customMessage: 'Dette er ikke et gyldig kontonummer',
      },
    },
  };
};

export default accountNumberBuilder;
