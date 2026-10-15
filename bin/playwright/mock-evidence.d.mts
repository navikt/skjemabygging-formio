declare const verifyEvidence: (
    snapshot: unknown,
    epoch: { epochId: string; testId: string; attempt: number },
    expected: Record<string, string>,
) => void;

export { verifyEvidence };
