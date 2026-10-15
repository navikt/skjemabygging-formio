type Epoch = {
    epochId: string;
    testId: string;
    attempt: number;
    mode: string;
    pids: number[];
    startupMs: number;
    baseURL: string;
    backendURL: string;
    mockURL: string;
    adminURL: string;
    ports: [number, number, number, number];
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
    ports?: [number, number, number, number];
    portRange?: [number, number];
}) => Promise<Epoch>;

export { checkBuild, startTestEpoch, type Epoch };
