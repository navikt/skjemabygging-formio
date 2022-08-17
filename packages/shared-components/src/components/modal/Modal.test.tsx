import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal", () => {
  let onClose = jest.fn();
  beforeAll(() => {
    Modal.setAppElement(document.createElement("div"));
    render(
      <Modal onClose={onClose} open={true} appElement={document.createElement("div")}>
        Test
      </Modal>
    );
  });

  it("renders modal and check that it work", async () => {
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Lukk modalvindu" }));
    expect(onClose).toBeCalled();
  });
});
