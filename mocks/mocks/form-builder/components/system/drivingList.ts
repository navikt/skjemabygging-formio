import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const drivingList = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default drivingList;
