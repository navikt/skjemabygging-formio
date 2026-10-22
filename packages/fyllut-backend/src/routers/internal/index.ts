import { createInternalRouter } from '@navikt/skjemadigitalisering-shared-backend';
import { appMetrics } from '../../services';

const internalRouter = createInternalRouter({ register: appMetrics.register });

export default internalRouter;
