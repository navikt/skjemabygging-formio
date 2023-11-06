import url from './url';

describe('url', () => {
  it('Try and get valid url param', () => {
    const param = url.getUrlParam('?test=1', 'test');
    expect(param).toBe('1');
  });

  it('Try and get undefined url param', () => {
    const param = url.getUrlParam('?test=1', 'test2');
    expect(param).toBeUndefined();
  });

  it('Try and get empty url param', () => {
    const param = url.getUrlParam('test=', 'test');
    expect(param).toBe('');
  });

  it('Try and get with undefined queryString', () => {
    const param = url.getUrlParam(undefined, 'test');
    expect(param).toBeUndefined();
  });

  it('Try and get with empty queryString', () => {
    const param = url.getUrlParam('', 'test');
    expect(param).toBeUndefined();
  });
});
