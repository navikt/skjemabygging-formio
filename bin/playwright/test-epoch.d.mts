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
    quiesce: () => Promise<void>;
    stop: () => Promise<void>;
};

declare const checkBuild: (mode: string, repoRoot?: string) => string[];
declare const startTestEpoch: (options: {
    mode: string;
    testId: string;
    attempt: number;
    output: string;
    signal?: AbortSignal;
    observeMocks?: boolean;
    mockFault?: 'hold-pdf' | 'missing-static-form';
}) => Promise<Epoch>;

export { checkBuild, startTestEpoch, type Epoch };
