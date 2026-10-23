import { createInternalRouter } from '@navikt/skjemadigitalisering-shared-backend';
import { metricsRegister } from '../../services';

const internalRouter = createInternalRouter({ register: metricsRegister });

export default internalRouter;
