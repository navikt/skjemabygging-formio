/**
 * This should be used when creating <Component>.builder.ts files,
 * so we have some default values we can change for all custom components
 */
const defaultBuilderSchema = () => {
  return {
    validateOn: 'blur',
    validate: {
      required: true,
    },
  };
};

export { defaultBuilderSchema };
