import { http } from "@navikt/skjemadigitalisering-shared-components";
import httpFyllut from "./httpFyllut";

const originalWindowLocation = window.location;

describe("httpFyllut", () => {
  it("submission method header", () => {
    Object.defineProperty(window, "location", {
      value: {
        search: "?sub=digital",
      },
      writable: true,
    });

    const headers = httpFyllut.getDefaultHeaders();
    expect(headers).toEqual({ "Fyllut-Submission-Method": "digital" });

    window.location = originalWindowLocation;
  });

  it("401 redirect", async () => {
    const replace = jest.fn();
    Object.defineProperty(window, "location", {
      value: {
        replace,
      },
      writable: true,
    });

    jest.spyOn(http, "get").mockImplementation(() => {
      return new Promise((resolve, reject) => {
        reject(new httpFyllut.UnauthenticatedError());
      });
    });

    try {
      await httpFyllut.get("https://www.nav.no");
    } catch (e) {
      expect(replace).toHaveBeenCalledTimes(1);
    }

    window.location = originalWindowLocation;
  });
});
