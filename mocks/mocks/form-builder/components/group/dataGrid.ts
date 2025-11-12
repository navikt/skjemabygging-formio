import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const dataGrid = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default dataGrid;
