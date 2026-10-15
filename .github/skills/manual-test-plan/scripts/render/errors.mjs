class RenderError extends Error {}

const fail = (message) => {
  throw new RenderError(message);
};

export { RenderError, fail };
