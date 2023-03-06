import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { Operator } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { DryRunResult, DryRunResults } from "../../types/migration";
import FeedbackProvider from "../context/notifications/feedbackContext";
import MigrationPage from "./MigrationPage";
import { migrationOptionsAsMap } from "./utils";

Modal.setAppElement(document.createElement("div"));

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

  const wrapper = ({ children }) => (
    <FeedbackProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </FeedbackProvider>
  );

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(dryRunResponse), {
          headers: {
            "content-type": "application/json",
          },
        })
      )
    );
    // @ts-ignore
    render(<MigrationPage />, { wrapper });
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  const setMigrateOptionInput = (index, prop, value, operator?: Operator) => {
    fireEvent.change(screen.getAllByLabelText("Feltnavn")[index], { target: { value: prop } });
    fireEvent.change(screen.getAllByLabelText("Verdi")[index], { target: { value } });
    if (operator) {
      fireEvent.change(screen.getAllByLabelText("Operator")[index], { target: { value: operator } });
    }
  };

  const addFilterOption = () => {
    fireEvent.click(screen.getByRole("button", { name: "Legg til filtreringsvalg" }));
  };

  it("renders the main heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Søk og migrer");
  });

  it("renders options form for search filters and edit options", () => {
    expect(screen.getByRole("heading", { level: 2, name: "Filtrer" }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Sett opp felter som skal migreres og ny verdi for feltene" })
    );
  });

  describe("Migration dry run", () => {
    it("performs a search with the provided search filters", async () => {
      setMigrateOptionInput(0, "searchFilter1", true);
      fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"searchFilter1":true}&editOptions={}',
        expectedGetOptions
      );
    });

    it("performs a search with several search filters", async () => {
      setMigrateOptionInput(0, "prop1", true);
      addFilterOption();
      setMigrateOptionInput(1, "prop2", 99);
      addFilterOption();
      setMigrateOptionInput(2, "prop3", false);
      fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1":true,"prop2":99,"prop3":false}&editOptions={}',
        expectedGetOptions
      );
    });

    it("performs a search with operators", async () => {
      setMigrateOptionInput(0, "prop1", "hello", "n_eq");
      addFilterOption();
      setMigrateOptionInput(1, "prop2", "world!", "eq");
      addFilterOption();
      setMigrateOptionInput(2, "prop3", true);
      fireEvent.click(screen.getByRole("button", { name: "Simuler og kontroller migrering" }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1__n_eq":"hello","prop2":"world!","prop3":true}&editOptions={}',
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
        const tables = within(modal).getAllByRole("table");
        expect(screen.getByText("Skjemaer som vil bli migrert")).toBeTruthy();
        expect(within(tables[0]).getAllByRole("row")[1]).toHaveTextContent("Skjema 3");
        expect(screen.getByText("Skjemaer som ikke vil bli migrert")).toBeTruthy();
        expect(within(tables[1]).getAllByRole("row")[1]).toHaveTextContent("Skjema 1");
        expect(
          screen.getByText("Skjemaer som matcher søkekriteriene, men ikke er aktuelle for migrering")
        ).toBeTruthy();
        expect(within(tables[2]).getAllByRole("row")[1]).toHaveTextContent("Skjema 2");
      });

      it("sends a POST request with instructions for the migration", async () => {
        const modal = screen.getByRole("dialog");
        const confirmMigrationButton = within(modal).getByRole("button", { name: "Bekreft migrering" });
        fireEvent.click(confirmMigrationButton);
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchSpy).toHaveBeenCalledWith("/api/migrate/update", {
          body: JSON.stringify({
            payload: { searchFilters: { prop1: true }, editOptions: { prop1: false }, include: ["form3"] },
          }),
          headers: { "Bygger-Formio-Token": "", "content-type": "application/json" },
          method: "POST",
        });
      });
    });
  });

  describe("migrationOptionsAsMap", () => {
    it("standard mapping", () => {
      const map = migrationOptionsAsMap({
        "1": {
          key: "k1",
          value: "v1",
        },
        "2": {
          key: "k2",
          value: "v2",
        },
      });
      expect(Object.keys(map).length).toBe(2);
    });

    it("duplicate key ignored", () => {
      const map = migrationOptionsAsMap({
        "1": {
          key: "k1",
          value: "v1",
        },
        "2": {
          key: "k1",
          value: "v1",
        },
      });
      expect(Object.keys(map).length).toBe(1);
    });
  });
});
