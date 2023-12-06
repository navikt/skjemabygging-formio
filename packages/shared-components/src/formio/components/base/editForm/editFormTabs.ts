import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const createTabs = (...components: Component[]): Partial<Component> => {
  return {
    components: [
      {
        type: 'tabs',
        key: 'tabs',
        label: '',
        components,
      },
    ],
  };
};
const display = (components: Component[]): Component => {
  return {
    label: 'Visning',
    key: 'display',
    type: 'editFormTab',
    weight: 0,
    components,
  };
};

const data = (components: Component[]): Component => {
  return {
    label: 'Data',
    key: 'data',
    type: 'editFormTab',
    weight: 20,
    components,
  };
};

const validation = (components: Component[]): Component => {
  return {
    label: 'Validering',
    key: 'validation',
    type: 'editFormTab',
    weight: 30,
    components,
  };
};

const api = (components: Component[]): Component => {
  return {
    label: 'API',
    key: 'api',
    type: 'editFormTab',
    weight: 40,
    components,
  };
};

const conditional = (components: Component[]): Component => {
  return {
    label: 'Betinget visning',
    key: 'conditional',
    type: 'editFormTab',
    weight: 50,
    components,
  };
};

const editFormTabs = {
  createTabs,
  display,
  data,
  validation,
  api,
  conditional,
};

export default editFormTabs;
