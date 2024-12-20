import { http } from 'msw';
import optionsResolver from './resolvers/options';

export const handlers = [http.options('*', optionsResolver)];
