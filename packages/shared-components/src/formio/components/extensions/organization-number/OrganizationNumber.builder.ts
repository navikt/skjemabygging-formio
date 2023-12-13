import { defaultBuilderSchema } from '../../base/builderHelper';
import OrganizationNumber from './OrganizationNumber';

const organizationNumberBuilder = () => {
  const schema = OrganizationNumber.schema();
  return {
    title: schema.label,
    group: 'organisasjon',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
      validate: {
        ...defaultBuilderSchema().validate,
        custom: 'valid = instance.validateOrganizationNumber(input)',
      },
    },
  };
};

export default organizationNumberBuilder;

/*

 */
