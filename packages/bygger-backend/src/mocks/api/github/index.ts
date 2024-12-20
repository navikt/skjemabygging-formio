import { http } from 'msw';
import getContent from './resolvers/getContent';

export const handlers = [
  http.get('https://api.github.com/repos/navikt/skjemautfylling-formio/contents/:path', getContent),
];
