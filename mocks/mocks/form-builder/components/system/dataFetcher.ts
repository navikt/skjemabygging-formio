import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const dataFetcher = (props: BaseComponentType) => {
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {};

export default dataFetcher;
