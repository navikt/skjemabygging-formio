import {TestContext} from "./testTools";
import {FakeBackend} from "./fakeBackend/FakeBackend";
import {InprocessQuipApp} from "./fakeBackend/InprocessQuipApp";
import {dispatcherWithBackend} from "./fakeBackend/fakeWebApp";

export class FakeBackendTestContext extends TestContext {
  setup() {
    super.setup();
    this.spy = jest.spyOn(global, 'fetch');
    this.backend = new FakeBackend();
    this.fetchAppGlue = new InprocessQuipApp(dispatcherWithBackend(this.backend));
    this.spy.mockImplementation(this.fetchAppGlue.fetchImpl);
  }

  tearDown() {
    super.tearDown();
    this.spy.mockReset();
  }
}
