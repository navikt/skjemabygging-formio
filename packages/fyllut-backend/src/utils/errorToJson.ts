if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function (this: Error & Record<string, unknown>) {
      const alt: Record<string, unknown> = {};

      Object.getOwnPropertyNames(this).forEach((key) => {
        alt[key] = this[key];
      });

      return alt;
    },
    configurable: true,
    writable: true,
  });
}
