import { generateId, trimAndLowerCase } from './utils/dataUtils';

interface PanelType {
  title: string;
  key?: string;
  components?: any[];
}

const panel = ({ title, key, components = [] }: PanelType) => {
  return {
    id: generateId(),
    navId: generateId(),
    key: key ?? trimAndLowerCase(title),
    type: 'panel',
    title,
    components,
  };
};

export default panel;
export type { PanelType };
