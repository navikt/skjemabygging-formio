import { fireEvent, render, screen } from "@testing-library/react";
import MigrationOptionsForm from "./MigrationOptionsForm";

describe("MigrationOptionsForm", () => {
  const onSubmitMock = vi.fn();
  const dispatchMock = vi.fn();
  beforeEach(() => {
    render(
      <MigrationOptionsForm title="title" addRowText="addRowText" dispatch={dispatchMock} testId="search-filters">
        <></>
      </MigrationOptionsForm>
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
});
