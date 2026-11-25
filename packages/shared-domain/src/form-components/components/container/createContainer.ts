import { Component } from '../../../models';

const createContainer = (props: Partial<Component> = {}): Component => ({
  type: 'container',
  key: 'container',
  label: 'Beholder',
  input: true,
  tree: true,
  hideLabel: true,
  components: [],
  ...props,
});

export { createContainer };
