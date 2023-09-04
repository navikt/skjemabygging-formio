import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TranslationTextInput from "./TranslationTextInput";

describe("TranslationTextInput", () => {
  const mockedOnChange = vi.fn();
  const mockedSetHasGlobalTranslation = vi.fn();
  const mockedSetGlobalTranslation = vi.fn();
  const setUp = (
    type,
    value = "native translation",
    hasGlobalTranslation = false,
    showGlobalTranslation = false,
    tempGlobalTranslation = undefined
  ) => {
    render(
      <TranslationTextInput
        text={"Original text"}
        value={value}
        type={type}
        hasGlobalTranslation={hasGlobalTranslation}
        showGlobalTranslation={showGlobalTranslation}
        onChange={mockedOnChange}
        setHasGlobalTranslation={mockedSetHasGlobalTranslation}
        setGlobalTranslation={mockedSetGlobalTranslation}
        tempGlobalTranslation={tempGlobalTranslation}
      />
    );
  };

  afterEach(() => {
    mockedOnChange.mockClear();
    mockedSetHasGlobalTranslation.mockClear();
    mockedSetGlobalTranslation.mockClear();
  });

  describe("when type is textArea", () => {
    beforeEach(() => {
      setUp("textArea", false, false, "textAreaValue");
    });

    it("renders textArea", () => {
      expect(screen.getByRole("textbox").getAttribute("type")).toBe("textArea");
    });

    it("does not render input description", () => {
      expect(screen.queryByText("Denne teksten er globalt oversatt")).toBeNull();
    });

    it("input is not readonly", () => {
      expect(screen.getByRole("textbox")).not.toHaveAttribute("readonly");
    });

    it("calls onChange with value", async () => {
      const textArea = screen.getByRole("textbox");
      fireEvent.change(textArea, { target: { value: "new textArea translation" } });
      await waitFor(() => expect(mockedOnChange).toHaveBeenCalledTimes(1));
      expect(mockedOnChange).toHaveBeenCalledWith("new textArea translation");
    });
  });

  describe("when type is text", () => {
    beforeEach(() => {
      setUp("text");
    });
    it("renders Input with type text", () => {
      expect(screen.getByRole("textbox").getAttribute("type")).toBe("text");
    });

    it("does not render input description", () => {
      expect(screen.queryByText("Denne teksten er globalt oversatt")).toBeNull();
    });

    it("input is not readonly", () => {
      expect(screen.getByRole("textbox")).not.toHaveAttribute("readonly");
    });

    it("calls onChange with value", async () => {
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "new input translation" } });
      await waitFor(() => expect(mockedOnChange).toHaveBeenCalledTimes(1));
      expect(mockedOnChange).toHaveBeenCalledWith("new input translation");
    });
  });

  describe("When showGlobalTranslation is true", () => {
    describe("When text has global translation", () => {
      beforeEach(() => {
        setUp("text", "global translation", true, true);
      });

      it("renders description", () => {
        expect(screen.getByText("Denne teksten er globalt oversatt")).toBeDefined();
      });

      it("input is readonly", () => {
        expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
      });

      it("renders locked icon", () => {
        expect(screen.getByTitle("Lås opp for å overstyre global oversettelse")).toBeDefined();
      });

      describe("onClick", () => {
        beforeEach(() => {
          const lockedIcon = screen.getByTitle("Lås opp for å overstyre global oversettelse");
          fireEvent.click(lockedIcon);
        });

        it("toggles global translation", () => {
          expect(mockedSetHasGlobalTranslation).toHaveBeenCalledTimes(1);
          expect(mockedSetHasGlobalTranslation).toHaveBeenCalledWith(false);
        });

        it("sets global translation empty", () => {
          expect(mockedSetGlobalTranslation).toHaveBeenCalledTimes(1);
          expect(mockedSetGlobalTranslation).toHaveBeenCalledWith("");
        });
      });
    });

    describe("When text does not have global translation", () => {
      beforeEach(() => {
        setUp("text", "", false, true, "temporary global translation");
      });

      it("renders unlocked icon", () => {
        expect(screen.getByTitle("Bruk global oversettelse")).toBeDefined();
      });

      describe("onClick", () => {
        beforeEach(() => {
          const lockedIcon = screen.getByTitle("Bruk global oversettelse");
          fireEvent.click(lockedIcon);
        });

        it("toggles global translation", () => {
          expect(mockedSetHasGlobalTranslation).toHaveBeenCalledTimes(1);
          expect(mockedSetHasGlobalTranslation).toHaveBeenCalledWith(true);
        });

        it("sets global translation to tempGlobalTranslation", () => {
          expect(mockedSetGlobalTranslation).toHaveBeenCalledTimes(1);
          expect(mockedSetGlobalTranslation).toHaveBeenCalledWith("temporary global translation");
        });
      });
    });
  });
});
