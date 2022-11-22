import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import SearchFilterInput from "./SearchFilterInput";

describe("SearchFilterInput", () => {
  const dispatchMock = jest.fn();
  beforeEach(() => {
    render(<SearchFilterInput id={"id"} searchFilter={{ key: "Feltnavn", value: "" }} dispatch={dispatchMock} />);
  });
  describe("Feltnavn input field", () => {
    it("is rendered", () => {
      expect(screen.getByLabelText("Feltnavn")).toBeDefined();
    });

    it("dispatches an edit action with key in the payload on change", () => {
      fireEvent.change(screen.getByLabelText("Feltnavn"), { target: { value: "feltnavn-key" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "id", key: "feltnavn-key" } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Operator input field", () => {
    it("is rendered", () => {
      expect(screen.getByLabelText("Operator")).toBeDefined();
      expect(screen.getByLabelText("Operator")).toHaveDisplayValue("EQUALS");
    });

    it("dispatches an edit action with value on change", () => {
      fireEvent.change(screen.getByLabelText("Operator"), { target: { value: "n_eq" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "id", operator: "n_eq" } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Verdi input field", () => {
    it("is rendered", () => {
      expect(screen.getByLabelText("Verdi")).toBeDefined();
    });

    it("dispatches an edit action with value on change", () => {
      fireEvent.change(screen.getByLabelText("Verdi"), { target: { value: "value" } });
      expect(dispatchMock).toHaveBeenCalledWith({ type: "edit", payload: { id: "id", value: "value" } });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });
});
