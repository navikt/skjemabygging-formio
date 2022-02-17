import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { DryRunResult, DryRunResults } from "../../types/migration";
import MigrationPage from "./MigrationPage";

describe("MigrationPage", () => {
  let fetchSpy;

  const expectedGetOptions = {
    headers: { "content-type": "application/json" },
    method: "GET",
  };

  const defaultdryRunResponse: DryRunResult = {
    skjemanummer: "form",
    name: "Skjema",
    title: "title",
    path: "form",
    found: 0,
    changed: 0,
    diff: [{ key: "1", label: "label", id: "123", property: { _ORIGINAL: "original value", _NEW: "new value" } }],
  };
  const dryRunResponse: DryRunResults = {
    form1: { ...defaultdryRunResponse, skjemanummer: "form1", path: "form1", name: "Skjema 1", found: 2, changed: 1 },
    form2: { ...defaultdryRunResponse, skjemanummer: "form2", path: "form2", name: "Skjema 2", found: 1, changed: 0 },
    form3: { ...defaultdryRunResponse, skjemanummer: "form3", path: "form3", name: "Skjema 3", found: 3, changed: 2 },
  };

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch").mockImplementation((url) =>
      Promise.resolve(
        new Response(JSON.stringify(dryRunResponse), {
          headers: {
            "content-type": "application/json",
          },
        })
      )
    );
    render(<MigrationPage />, { wrapper: MemoryRouter });
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  const setMigrateOptionInput = (index, prop, value) => {
    fireEvent.change(screen.getAllByLabelText("Feltnavn")[index], { target: { value: prop } });
    fireEvent.change(screen.getAllByLabelText("Verdi")[index], { target: { value } });
  };

  it("renders the main heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Søk og migrer");
  });

  it("renders options form for search filters and edit options", () => {
    expect(screen.getByRole("heading", { level: 2, name: "Søk og filtrer" }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Sett opp felter som skal migreres og ny verdi for feltene" })
    );
  });

  describe("Migration dry run", () => {
    it("performs a search with the provided search filters", async () => {
      setMigrateOptionInput(0, "searchFilter1", true);
      fireEvent.click(screen.getByRole("button", { name: "Søk" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"searchFilter1":true}&editOptions={}',
        expectedGetOptions
      );
    });

    it("performs a search with several search filters", async () => {
      setMigrateOptionInput(0, "prop1", true);
      fireEvent.click(screen.getByRole("button", { name: "Legg til filtreringsvalg" }));
      setMigrateOptionInput(1, "prop2", 99);
      fireEvent.click(screen.getByRole("button", { name: "Legg til filtreringsvalg" }));
      setMigrateOptionInput(2, "prop3", false);
      fireEvent.click(screen.getByRole("button", { name: "Søk" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1":true,"prop2":99,"prop3":false}&editOptions={}',
        expectedGetOptions
      );
    });

    it("performs a migration dryrun with several edit options", async () => {
      setMigrateOptionInput(1, "prop1", true);
      fireEvent.click(screen.getByRole("button", { name: "Legg til felt som skal endres" }));
      setMigrateOptionInput(2, "prop2", 99);
      fireEvent.click(screen.getByRole("button", { name: "Legg til felt som skal endres" }));
      setMigrateOptionInput(3, "prop3", false);
      fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={}&editOptions={"prop1":true,"prop2":99,"prop3":false}',
        expectedGetOptions
      );
    });

    it("performs a migration dryrun with search filters and edit options", async () => {
      setMigrateOptionInput(0, "prop1", true);
      setMigrateOptionInput(1, "prop1", false);
      fireEvent.click(screen.getByRole("button", { name: "Legg til felt som skal endres" }));
      setMigrateOptionInput(2, "prop2", "new value");
      fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1":true}&editOptions={"prop1":false,"prop2":"new value"}',
        expectedGetOptions
      );
    });
  });

  describe("Migration dry run results", () => {
    beforeEach(async () => {
      setMigrateOptionInput(0, "prop1", true);
      setMigrateOptionInput(1, "prop1", false);
      fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    });

    it("displays the number of components that will be affected by migration", async () => {
      expect(screen.getByText("Fant 3 skjemaer som matcher søkekriteriene.")).toBeTruthy();
      expect(screen.getByText("Totalt vil 3 av 6 komponenter bli påvirket av endringene.")).toBeTruthy();
    });

    describe("Preview button", () => {
      it("is rendered for each form", () => {
        const previewLinks = screen.getAllByRole("link", { name: "Forhåndsvis" });
        const actualSearchParams = '?searchFilters={"prop1":true}&editOptions={"prop1":false}';
        expect(previewLinks).toHaveLength(3);
        expect(previewLinks[0]).toHaveAttribute("href", `/migrering/forhandsvis/form3${actualSearchParams}`);
        expect(previewLinks[1]).toHaveAttribute("href", `/migrering/forhandsvis/form1${actualSearchParams}`);
        expect(previewLinks[2]).toHaveAttribute("href", `/migrering/forhandsvis/form2${actualSearchParams}`);
      });
    });
  });

  describe("Migration button", () => {
    it("is not displayed until a dry run has been performed", () => {
      expect(screen.queryByRole("Button", { name: "Migrer" })).toBeNull();
    });

    describe("onClick", () => {
      beforeEach(async () => {
        setMigrateOptionInput(0, "prop1", true);
        setMigrateOptionInput(1, "prop1", false);
        fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
        await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
        fireEvent.click(screen.getAllByLabelText("Inkluder i migrering")[1]);
        fireEvent.click(screen.getByRole("button", { name: "Migrer" }));
      });

      it("opens a modal with info on which forms have been selected for migration", () => {
        const modal = screen.getByRole("dialog");
        const formLists = within(modal).getAllByRole("list");
        expect(screen.getByText("Skjemaer som vil bli migrert")).toBeTruthy();
        expect(within(formLists[0]).getByRole("listitem")).toHaveTextContent("Skjema 3");
        expect(screen.getByText("Skjemaer som ikke vil bli migrert")).toBeTruthy();
        expect(within(formLists[1]).getByRole("listitem")).toHaveTextContent("Skjema 1");
        expect(
          screen.getByText("Skjemaer som matcher søkekriteriene, men ikke er aktuelle for migrering")
        ).toBeTruthy();
        expect(within(formLists[2]).getByRole("listitem")).toHaveTextContent("Skjema 2");
      });

      it("sends a POST request with instructions for the migration", async () => {
        const modal = screen.getByRole("dialog");
        const confirmMigrationButton = within(modal).getByRole("button", { name: "Bekreft migrering" });
        fireEvent.click(confirmMigrationButton);
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchSpy).toHaveBeenCalledWith("/api/migrate/update", {
          body: JSON.stringify({
            token: "",
            payload: { searchFilters: { prop1: true }, editOptions: { prop1: false }, include: ["form3"] },
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        });
      });
    });
  });
});
