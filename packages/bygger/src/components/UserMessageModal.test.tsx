import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserMessageModal, { useUserMessage } from "./UserMessageModal";

Modal.setAppElement(document.createElement("div"));

describe("UserMessageModal", () => {
  const THIS_IS_THE_MESSAGE = "This is the message";

  const TestComponent = () => {
    const [userMessage, showUserMessage, closeModal] = useUserMessage();
    return (
      <div>
        <UserMessageModal userMessage={userMessage} closeModal={closeModal} />
        <button onClick={() => showUserMessage(THIS_IS_THE_MESSAGE)}>Show message</button>
      </div>
    );
  };

  it("Modal is closed by default", () => {
    render(<TestComponent />);
    expect(screen.queryByText(THIS_IS_THE_MESSAGE)).not.toBeInTheDocument();
    const okButton = screen.queryByRole("button", { name: "Ok" });
    expect(okButton).not.toBeInTheDocument();
  });

  describe("User message", () => {
    beforeEach(() => {
      render(<TestComponent />);
    });

    it("is rendered", async () => {
      const showMessageButton = screen.getByRole("button", { name: "Show message" });
      await userEvent.click(showMessageButton);
      expect(screen.queryByText(THIS_IS_THE_MESSAGE)).toBeInTheDocument();
      const okButton = screen.queryByRole("button", { name: "Ok" });
      expect(okButton).toBeInTheDocument();
    });

    it("is hid", async () => {
      const showMessageButton = screen.getByRole("button", { name: "Show message" });
      await userEvent.click(showMessageButton);
      const okButton = screen.getByRole("button", { name: "Ok" });
      await userEvent.click(okButton);
      expect(screen.queryByText(THIS_IS_THE_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Ok" })).not.toBeInTheDocument();
    });
  });
});
