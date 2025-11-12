import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const activities = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default activities;
