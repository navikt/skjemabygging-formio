export class CorsError extends Error {
  constructor(rejectedOrigin: string | undefined) {
    super(`CORS: Origin not allowed (${rejectedOrigin})`);
  }
}
