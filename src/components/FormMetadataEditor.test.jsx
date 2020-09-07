import { FormMetadataEditor } from "./FormMetadataEditor";
import React from "react";
import { render, screen, waitForDomChange, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import waitForExpect from "wait-for-expect";
import { FakeBackend } from "../fakeBackend/FakeBackend";
import { AuthContext } from "../context/auth-context";
import AuthenticatedApp from "../AuthenticatedApp";
import { MemoryRouter } from "react-router-dom";
import { UserAlerterContext } from "../userAlerting";

describe("FormMetadataEditor", () => {
  let mockOnChange;
  let fakeBackend;

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnChange = jest.fn();
    fakeBackend = new FakeBackend();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("title should be immutable", async () => {
    const { rerender } = render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);

    await userEvent.clear(screen.getByRole("textbox", { name: /Skjemanummer/i }));
    await waitFor(() => expect(mockOnChange).not.toHaveBeenCalled());
  });

  it("should display form name", async () => {
    render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByRole("textbox", { name: /Navn/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Navn/i }).readOnly).toBe(true);
  });

  it("should update form when display is changed", async () => {
    const { rerender } = render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Vis som/i)).toHaveValue("form");

    await userEvent.selectOptions(screen.getByLabelText(/Vis som/i), "wizard");

    const updatedForm = { ...fakeBackend.form(), display: "wizard" };
    await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

    rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Vis som/i)).toHaveValue("wizard");
  });

  it("should display form path", async () => {
    render(<FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />);
    expect(screen.getByRole("textbox", { name: /Path/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Path/i }).readOnly).toBe(true);
  });

  it("should display changes when onChange is called", async () => {
    const userAlerter = {
      flashSuccessMessage: jest.fn(),
      alertComponent: jest.fn(),
    };
    render(
      <MemoryRouter initialEntries={[`/forms/${fakeBackend.form().path}/edit`]}>
        <AuthContext.Provider
          value={{
            userData: "fakeUser",
            login: () => {},
            logout: () => {},
          }}
        >
          <UserAlerterContext.Provider value={userAlerter}>
            <AuthenticatedApp formio={{}} store={{ forms: [fakeBackend.form()] }} />
          </UserAlerterContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    let visningsModus = await screen.getByLabelText(/Vis som/i);
    expect(visningsModus).toHaveValue("form");
    await userEvent.selectOptions(visningsModus, "wizard");
    jest.runAllTimers();
    await waitFor(() => expect(visningsModus).toHaveValue("wizard"));
  });
});
