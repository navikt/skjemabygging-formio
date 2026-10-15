import { coverPageDownloadDataMapper } from './coverPageDownloadDataMapper';
import { mapPartyToCoverPage } from './coverPagePartyMapper';
import { coverPageRequestBodyMapper } from './coverPageRequestBodyMapper';

const coverPageMapper = {
  ...coverPageDownloadDataMapper,
  ...coverPageRequestBodyMapper,
  mapPartyToCoverPage,
};

export type { CoverPagePartyData } from './coverPagePartyMapper';
export { coverPageMapper };
