import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const formGroup = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default formGroup;
