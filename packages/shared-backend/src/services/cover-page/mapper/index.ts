import { coverPageDownloadDataMapper } from './coverPageDownloadDataMapper';
import { coverPageRequestBodyMapper } from './coverPageRequestBodyMapper';

const coverPageMapper = {
  ...coverPageDownloadDataMapper,
  ...coverPageRequestBodyMapper,
};

export { coverPageMapper };
