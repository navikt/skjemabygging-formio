import { setupServer } from 'msw/node';
import { handlers as formioHandlers } from './api/formio';
import { handlers as formsApiHandlers } from './api/forms-api';
import { handlers as fyllutHandlers } from './api/fyllut';
import { handlers as githubHandlers } from './api/github';
import { handlers as commonHandlers } from './common';

const allHandlers = [...commonHandlers, ...formioHandlers, ...formsApiHandlers, ...fyllutHandlers, ...githubHandlers];

export const server = setupServer(...allHandlers);
