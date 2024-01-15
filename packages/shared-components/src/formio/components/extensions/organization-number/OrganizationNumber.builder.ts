import OrganizationNumber from './OrganizationNumber';

const organizationNumberBuilder = () => {
  const schema = OrganizationNumber.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateOrganizationNumber(input)',
      },
    },
  };
};

export default organizationNumberBuilder;

/*

 */
