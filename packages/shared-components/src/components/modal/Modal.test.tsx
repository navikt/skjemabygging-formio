import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Modal from "./Modal";

describe("Modal", () => {
  let onClose = jest.fn();
  beforeAll(() => {
    render(
      <Modal onClose={onClose} title="New modal" open={true}>
        <div>Content</div>
      </Modal>
    );
  });

  it("renders modal and check that it work", async () => {
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Lukk" }));
    expect(onClose).toBeCalled();
  });
});
