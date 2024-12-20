import { http } from 'msw';
import config from '../../../config';
import getArchiveSubjects from './resolvers/getArchiveSubjects';

const fyllutBaseUrl = config.fyllut.baseUrl;

export const handlers = [http.get(`${fyllutBaseUrl}/api/common-codes/archive-subjects`, getArchiveSubjects)];
