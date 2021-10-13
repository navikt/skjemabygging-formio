import { getCountries } from "./countries";
import { jest } from "@jest/globals";
import countries from "i18n-iso-countries";

describe("getCountries", () => {
  countries.getNames = jest.fn().mockReturnValue({});

  afterEach(() => {
    countries.getNames.mockClear();
  });

  it("gets country names in Bokmål by default", () => {
    getCountries();
    expect(countries.getNames).toHaveBeenCalledTimes(1);
    expect(countries.getNames).toHaveBeenCalledWith("nb");
  });

  it("gets country names in the provided language", () => {
    getCountries("de");
    expect(countries.getNames).toHaveBeenCalledTimes(1);
    expect(countries.getNames).toHaveBeenCalledWith("de");
  });

  it("returns an array of objects with label and value", () => {
    countries.getNames.mockReturnValue({ AA: "Name1", BB: "Name2", CC: "Name3" });
    expect(getCountries()).toStrictEqual([
      { label: "Name1", value: "AA" },
      { label: "Name2", value: "BB" },
      { label: "Name3", value: "CC" },
    ]);
  });

  it("returns an array of objects sorted by label", () => {
    countries.getNames.mockReturnValue({ AA: "Åland", BB: "Aland", CC: "Øland", DD: "Oland" });
    expect(getCountries()).toStrictEqual([
      { label: "Aland", value: "BB" },
      { label: "Oland", value: "DD" },
      { label: "Øland", value: "CC" },
      { label: "Åland", value: "AA" },
    ]);
  });
});
