import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const createTabs = (...components: Component[]): Component => {
  return {
    components: [
      {
        type: 'tabs',
        key: 'tabs',
        components,
      },
    ],
  };
};
const display = (components: Component[]): Component => {
  return {
    label: 'Visning',
    key: 'display',
    weight: 0,
    components,
  };
};

const data = (components: Component[]): Component => {
  return {
    label: 'Data',
    key: 'data',
    weight: 20,
    components,
  };
};

const validation = (components: Component[]): Component => {
  return {
    label: 'Validering',
    key: 'validation',
    type: '',
    weight: 30,
    components,
  };
};

const api = (components: Component[]): Component => {
  return {
    label: 'API',
    key: 'api',
    type: '',
    weight: 40,
    components,
  };
};

const conditional = (components: Component[]): Component => {
  return {
    label: 'Betinget visning',
    key: 'conditional',
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
