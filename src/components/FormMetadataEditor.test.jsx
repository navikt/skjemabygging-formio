import { FormMetadataEditor } from "./FormMetadataEditor";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import waitForExpect from "wait-for-expect";
import { FakeBackend } from "../fakeBackend/FakeBackend";

describe("FormMetadataEditor", () => {
  let mockOnChange;
  let fakeBackend;

  beforeEach(() => {
    mockOnChange = jest.fn();
    fakeBackend = new FakeBackend();
  });

  it("should update form when title is changed", async () => {
    const { rerender } = render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    await userEvent.type(screen.getByRole("textbox", { name: /Title/i }), "Søknad om førerhund");

    const updatedForm = { ...fakeBackend.form(), title: "Søknad om førerhund" };
    await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

    rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
    expect(screen.getByRole("textbox", { name: /Title/i })).toHaveValue("Søknad om førerhund");
  });

  it("should display form name", async () => {
    render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByRole("textbox", { name: /Name/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Name/i }).readOnly).toBe(true);
  });

  it("should update form when display is changed", async () => {
    const { rerender } = render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Display as/i)).toHaveValue("form");

    await userEvent.selectOptions(screen.getByLabelText(/Display as/i), "wizard");

    const updatedForm = { ...fakeBackend.form(), display: "wizard" };
    await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

    rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Display as/i)).toHaveValue("wizard");
  });

  it("should update form when type is changed", async () => {
    const { rerender } = render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Type/i)).toHaveValue("form");

    await userEvent.selectOptions(screen.getByLabelText(/Type/i), "resource");

    const updatedForm = { ...fakeBackend.form(), type: "resource" };
    await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

    rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Type/i)).toHaveValue("resource");
  });

  it("should display form path", async () => {
    render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByRole("textbox", { name: /Path/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Path/i }).readOnly).toBe(true);
  });
});
