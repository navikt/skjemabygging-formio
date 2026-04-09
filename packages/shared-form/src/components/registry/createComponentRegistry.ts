import { resolveTextField } from '../standard/text-field';
import { ComponentRegistry } from './componentRegistry';

const createComponentRegistry = (): ComponentRegistry => ({
  textfield: resolveTextField,
});

export { createComponentRegistry };
