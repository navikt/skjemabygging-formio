import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const row = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default row;
