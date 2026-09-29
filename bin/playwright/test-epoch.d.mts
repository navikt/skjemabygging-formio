type Epoch = {
    epochId: string;
    testId: string;
    attempt: number;
    mode: string;
    pids: number[];
    startupMs: number;
    baseURL: string;
    mockURL: string;
    adminURL: string;
    directory: string;
    fatal: (error: Error) => void;
    assertHealthy: () => void;
    stop: () => Promise<void>;
};

declare const checkBuild: (mode: string) => void;
declare const startTestEpoch: (options: {
    mode: string;
    testId: string;
    attempt: number;
    output: string;
    signal?: AbortSignal;
}) => Promise<Epoch>;

export { checkBuild, startTestEpoch, type Epoch };
