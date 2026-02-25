import fetch from 'node-fetch';
import { toJsonOrThrowError } from './errorHandling';

const fetchFromApi = async (url) => {
  const response = await fetch(url, { method: 'GET' });
  return await toJsonOrThrowError(`Failed to retrieve data from ${url}`)(response);
};

export { fetchFromApi };
