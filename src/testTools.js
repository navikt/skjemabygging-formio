import TestRenderer from 'react-test-renderer';
import waitForExpect from "wait-for-expect";
// import {InprocessQuipApp} from "./fakeBackend/InprocessQuipApp";
// import {FakeBackend} from "./fakeBackend/FakeBackend";
// import {dispatcherWithBackend} from "./fakeBackend/fakeWebApp";


export class TestContext {
  defaultNodeMock = {
    createNodeMock: (element) => {
      if (element.type === 'input') {
        // return document.createElement('input');
        //console.log('createNodeMock got input', element.props);
      }
      if (element.type === 'textarea') {
        // console.log('createNodeMock got textarea', element.props);
        return document.createElement('textarea');
      }
      return null;
    }
  };

  testRenderer = {unmount: () => {}}; // hihi :-) null object

  setup() {
    this.consoleErrorSpy = jest.spyOn(global.console, 'error');
    this.consoleErrorSpy.mockReset();
    Document.prototype.exitFullscreen = jest.fn();
    jest.useFakeTimers();
  }

  tearDown() {
    this.testRenderer.unmount();
    jest.runAllTimers();
    jest.useRealTimers();
    expect(this.consoleErrorSpy).not.toHaveBeenCalled();
  }

  act(func)  {
    TestRenderer.act(func);
  }

  render(jsx, options) {
    this.testRenderer = TestRenderer.create(jsx, options);
    return this.testRenderer;
  }

  renderWithDefaultNodeMock(jsx) {
    return this.render(jsx, this.defaultNodeMock);
  }

  async waitForComponent(component) {
    await waitForExpect(() => expect(
      this.testRenderer.root.findAllByType(component)
        .map(instance => ({ props: instance.props, type: instance.type }))).toHaveLength(1));
    return this.testRenderer.root.findByType(component);
  }

  async waitForComponentByProps(props) {
    await waitForExpect(() => expect(
      this.testRenderer.root.findAllByProps(props)
        .map(instance => ({props: instance.props, type: instance.type}))).toHaveLength(1));
    return this.testRenderer.root.findByProps(props);
  }

  async waitForComponentToLoad(component) {
    const instance = await this.waitForComponent(component);
    await waitForExpect(() => expect(instance.instance.state.hasLoaded).toBeTruthy());
    return instance;
  }

  setupBeforeAfter() {
    beforeEach(() => {
      this.setup();
    });
    afterEach(() => {
      this.tearDown();
    });
  }
}

export const createJSONResponse = (json, initHash) => {
  if (!initHash) {
    initHash = { status: 200, statusText: "OK" };
  }
  const body = JSON.stringify(json); // avoid aliasing
  return {
    ok: initHash.status < 400,
    status: initHash.status,
    statusText: initHash.statusText,
    json: () => {
      return Promise.resolve(JSON.parse(body));
    },
    headers: new Map([['content-type', 'application/json']]),
    debugJsonBody: JSON.parse(body)
  };
};



