type ReadyType = {
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason?: Error) => void;
  reset: () => void;
};

const Ready = (): ReadyType => {
  let resolve;
  let reject;
  let promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject,
    reset: () => {
      resolve?.();
      promise = new Promise<void>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
    },
  } as ReadyType;
};

export default Ready;
