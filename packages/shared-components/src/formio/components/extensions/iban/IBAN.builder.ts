import { defaultBuilderSchema } from '../../base/builderHelper';
import IBAN from './IBAN';

const IBANBuilder = () => {
  const schema = IBAN.schema();
  return {
    title: 'IBAN',
    group: 'pengerOgKonto',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
      validate: {
        ...defaultBuilderSchema().validate,
        custom: 'valid = instance.validateIban(input);',
      },
    },
  };
};

export default IBANBuilder;
