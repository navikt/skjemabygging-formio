import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import MigrationOptionsForm from "./MigrationOptionsForm";

describe("MigrationOptionsForm", () => {
  const onSubmitMock = jest.fn();
  const dispatchMock = jest.fn();
  beforeEach(() => {
    render(
      <MigrationOptionsForm
        title={"title"}
        addRowText={"addRowText"}
        state={{ a: { key: "", value: "" } }}
        dispatch={dispatchMock}
      />
    );
  });

  afterEach(() => {
    onSubmitMock.mockClear();
    dispatchMock.mockClear();
  });

  it("renders title", () => {
    expect(screen.getByRole("heading", { name: "title" })).toBeDefined();
  });

  describe("Add row", () => {
    it("is rendered with addRowText", () => {
      expect(screen.getByRole("button", { name: "addRowText" })).toBeDefined();
    });

    it("dispatches an add action on click", () => {
      fireEvent.click(screen.getByRole("button", { name: "addRowText" }));
      expect(dispatchMock).toHaveBeenCalledWith({ type: "add" });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Feltnavn input field", () => {
    it("is rendered", () => {
      expect(screen.getByLabelText("Feltnavn")).toBeDefined();
    });

    it("dispatches an edit action with key in the payload on change", () => {
      fireEvent.change(screen.getByLabelText("Feltnavn"), { target: { value: "feltnavn-key" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "a", key: "feltnavn-key" } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Verdi input field", () => {
    it("is rendered", () => {
      expect(screen.getByLabelText("Verdi")).toBeDefined();
    });

    it("dispatches an edit action with value on change", () => {
      fireEvent.change(screen.getByLabelText("Verdi"), { target: { value: "value" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "a", value: "value" } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it("dispatches number values as number on change", () => {
      fireEvent.change(screen.getByLabelText("Verdi"), { target: { value: "123" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "a", value: 123 } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it("dispatches true as boolean value true on change", () => {
      fireEvent.change(screen.getByLabelText("Verdi"), { target: { value: "true" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "a", value: true } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it("dispatches false as boolean value false on change", () => {
      fireEvent.change(screen.getByLabelText("Verdi"), { target: { value: "false" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "a", value: false } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it("dispatches null as a null value on change", () => {
      fireEvent.change(screen.getByLabelText("Verdi"), { target: { value: "null" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "a", value: null } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });
});
