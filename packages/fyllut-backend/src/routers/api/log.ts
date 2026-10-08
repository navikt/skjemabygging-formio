import { createFrontendLogHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { logger } from '../../logger';

const log = {
  post: createFrontendLogHandler(logger),
};

export default log;
