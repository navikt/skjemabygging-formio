import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Modal from "./Modal";

describe("Modal", () => {
  let onRequestClose = jest.fn();
  beforeAll(() => {
    render(
      <Modal onRequestClose={onRequestClose} contentLabel="New modal" isOpen={true}>
        <div>Content</div>
      </Modal>
    );
  });

  it("renders modal and check that it work", async () => {
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Lukk" }));
    expect(onRequestClose).toBeCalled();
  });
});
