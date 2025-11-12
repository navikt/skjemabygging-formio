import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const container = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default container;
