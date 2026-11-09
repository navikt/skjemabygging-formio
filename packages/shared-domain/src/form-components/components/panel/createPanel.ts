import { Component } from '../../../models';

const createPanel = (props: Partial<Component> = {}): Component => ({
  type: 'panel',
  key: 'panel',
  label: 'Panel',
  components: [],
  ...props,
});

export { createPanel };
