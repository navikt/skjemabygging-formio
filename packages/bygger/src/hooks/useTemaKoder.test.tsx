import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import createMockImplementation from "../../test/backendMockImplementation";
import useTemaKoder from "./useTemaKoder";

describe("useTemaKoder", () => {
  let fetchSpy: jest.SpyInstance;
  let appConfig: WrapperComponent<any>;
  const projectUrl = "http://test.example.org";

  beforeEach(() => {
    appConfig = ({ children }) => <AppConfigProvider baseUrl={projectUrl}>{children}</AppConfigProvider>;
    fetchSpy = jest.spyOn(global, "fetch");
    fetchSpy.mockImplementation(createMockImplementation({ projectUrl }));
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  it("returns ready: false and empty temakoder initially", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
    expect(result.current.ready).toBe(false);
    expect(result.current.temaKoder).toEqual({});
    await waitForNextUpdate();
  });

  it("fetches temakoder and returns them when ready", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
    await waitForNextUpdate();
    expect(fetchSpy).toHaveBeenCalledWith(`${projectUrl}/api/temakoder`);
    expect(result.current.ready).toBe(true);
    expect(result.current.temaKoder).toEqual({ TEST: "test" });
  });

  describe("When fetch returns with not ok", () => {
    let errorSpy;
    beforeEach(() => (errorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn())));
    afterEach(() => errorSpy.mockClear());

    it("returns an error message", async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
      const { result, waitForNextUpdate } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
      await waitForNextUpdate();

      expect(result.current.errorMessage).toEqual("Feil ved henting av temakoder. Venligst prøv igjen senere.");
    });
  });
});
