import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const maalgruppe = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default maalgruppe;
