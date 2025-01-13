import dotenv from 'dotenv';

dotenv.config({ path: './src/test/test.env' });

const { mswUtils } = await import('./mocks');
global.mswUtils = mswUtils;
