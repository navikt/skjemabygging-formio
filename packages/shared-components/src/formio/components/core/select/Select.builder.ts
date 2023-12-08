import { defaultBuilderInfoSchema } from '../../base/builderHelper';
import NavSelect from './Select';

const selectBuilder = () => {
  return {
    title: 'Nedtrekksmeny',
    key: 'navSelect',
    icon: 'th-list',
    group: 'basic',
    schema: {
      ...defaultBuilderInfoSchema(),
      ...NavSelect.schema(),
    },
  };
};

export default selectBuilder;
