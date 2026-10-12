import type { Epoch } from './test-epoch.mjs';
declare const attachExistingEpoch: (options: {
    manifestPath: string;
    mode: string;
    testId: string;
    attempt: number;
    output: string;
}) => Promise<Epoch>;
export { attachExistingEpoch };
