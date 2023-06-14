export const createAppAuth = jest.fn().mockReturnValue(() => ({ auth: () => ({ token: "" }) }));
