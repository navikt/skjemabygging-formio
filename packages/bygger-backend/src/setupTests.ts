import { installFetchMock } from '@navikt/skjemadigitalisering-shared-backend/test';
import dotenv from 'dotenv';

dotenv.config({ path: './src/test/test.env' });

installFetchMock();
