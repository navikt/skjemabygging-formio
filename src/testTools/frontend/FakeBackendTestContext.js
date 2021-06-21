import { FakeBackend } from "../../fakeBackend/FakeBackend";
import { InprocessQuipApp } from "../../fakeBackend/InprocessQuipApp";
import { dispatcherWithBackend } from "../../fakeBackend/fakeWebApp";
import { TestContext } from "./TestContext";
import Formiojs from "formiojs/Formio";

export class FakeBackendTestContext extends TestContext {
  setup() {
    super.setup();
    this.spy = jest.spyOn(global, "fetch");
    this.formioSpy = jest.spyOn(Formiojs, "fetch");
    this.backend = new FakeBackend();
    this.fetchAppGlue = new InprocessQuipApp(dispatcherWithBackend(this.backend));
    this.spy.mockImplementation(this.fetchAppGlue.fetchImpl);
    this.formioSpy.mockReturnValueOnce(this.fetchAppGlue.fetchImpl);
  }

  tearDown() {
    super.tearDown();
    this.spy.mockReset();
    this.formioSpy.mockReset();
  }
}
