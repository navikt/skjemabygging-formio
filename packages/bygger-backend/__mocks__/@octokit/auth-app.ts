export const createAppAuth = vi.fn().mockReturnValue(() => ({ auth: () => ({ token: '' }) }));
