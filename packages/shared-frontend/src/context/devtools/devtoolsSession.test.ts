import { createDevtoolsReport, DevtoolsConnection, toSerializable } from './devtoolsSession';

const createConnection = () => ({ init: vi.fn(), send: vi.fn() }) satisfies DevtoolsConnection;

describe('devtoolsSession', () => {
  describe('toSerializable', () => {
    it('converts values that JSON renders as empty objects', () => {
      expect(
        toSerializable({
          pages: new Set(['a', 'b']),
          byKey: new Map([['x', 1]]),
          error: new TypeError('failed'),
        }),
      ).toEqual({
        pages: ['a', 'b'],
        byKey: { x: 1 },
        error: { name: 'TypeError', message: 'failed' },
      });
    });

    it('drops functions and replaces circular references', () => {
      const value: Record<string, unknown> = { name: 'Ada', onChange: () => undefined };
      value.self = value;

      expect(toSerializable(value)).toEqual({ name: 'Ada', self: '[Circular]' });
    });

    it('keeps repeated references that are not circular', () => {
      const shared = { key: 'a' };

      expect(toSerializable({ first: shared, second: shared })).toEqual({ first: shared, second: shared });
    });
  });

  describe('createDevtoolsReport', () => {
    it('sends each report labelled by slice together with all previously reported slices', () => {
      const connection = createConnection();
      const report = createDevtoolsReport(connection);

      report('submission', { data: { name: 'Ada' } }, 'set name');
      report('route', { pathname: '/page1' });

      expect(connection.init).toHaveBeenCalledWith({});
      expect(connection.send).toHaveBeenNthCalledWith(
        1,
        { type: 'submission/set name' },
        { submission: { data: { name: 'Ada' } } },
      );
      expect(connection.send).toHaveBeenNthCalledWith(
        2,
        { type: 'route/update' },
        { submission: { data: { name: 'Ada' } }, route: { pathname: '/page1' } },
      );
    });
  });
});
