import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import createMockImplementation from "../../test/backendMockImplementation";
import useTemaKoder from "./useTemaKoder";

describe("useTemaKoder", () => {
  // @ts-ignore
  let fetchSpy: vi.SpyInstance;
  let appConfig: any;
  const projectUrl = "http://test.example.org";

  beforeEach(() => {
    appConfig = ({ children }) => <AppConfigProvider baseUrl={projectUrl}>{children}</AppConfigProvider>;
    fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy.mockImplementation(createMockImplementation({ projectUrl }));
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  it("returns ready: false and empty temakoder initially", async () => {
    const { result } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
    expect(result.current.ready).toBe(false);
    expect(result.current.temaKoder).toEqual([]);
  });

  it("fetches temakoder and returns them when ready", async () => {
    const { result } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(`${projectUrl}/api/temakoder`);
      expect(result.current.ready).toBe(true);
      expect(result.current.temaKoder).toEqual([{ key: "TEST", value: "test" }]);
    });
  });

  describe("When fetch returns with not ok", () => {
    let errorSpy;
    // @ts-ignore
    beforeEach(() => (errorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn())));
    afterEach(() => errorSpy.mockClear());

    it("returns an error message", async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
      const { result } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
      await waitFor(() => {
        expect(result.current.errorMessage).toEqual("Feil ved henting av temakoder. Vennligst prøv igjen senere.");
      });
    });
  });
});
