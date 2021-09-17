import {renderHook} from "@testing-library/react-hooks";
import {useFormioForms} from "./useFormioForms";
import Formiojs from "formiojs/Formio";
import {FakeBackendTestContext} from "../testTools/frontend/FakeBackendTestContext";
import {Formio} from "formiojs";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe('useFormioForms', () => {

  let oldFormioFetch;
  let formStore;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
    formStore = { forms: null };
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  it("loads all forms in the hook", async () => {
    const formStore = { forms: null };
    const { result, waitForNextUpdate } = renderHook(() =>
      useFormioForms(new Formiojs("http://myproject.example.org"), formStore)
    );
    expect(formStore.forms).toEqual(null);
    await waitForNextUpdate();
    expect(result.current.forms).toEqual(context.backend.allForms);
    expect(context.backend.allForms).toEqual(formStore.forms);
  });

});
